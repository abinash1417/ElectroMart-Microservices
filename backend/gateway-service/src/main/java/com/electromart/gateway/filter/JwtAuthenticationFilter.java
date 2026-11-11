package com.electromart.gateway.filter;

import com.electromart.gateway.security.JwtUtils;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtils jwtUtils;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/users/register",
            "/users/login",
            "/images/**",
            "/api/password/**",
            "/api/contact/**",
            "/api/ai/**"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        String method = request.getMethod().name();

        // 0. Preflight OPTIONS requests must always pass for CORS
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return chain.filter(exchange);
        }

        // 1. Bypass public paths
        boolean isPublic = PUBLIC_ENDPOINTS.stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, path));

        // GET requests to products, categories, reviews are also public
        if ("GET".equalsIgnoreCase(method)) {
            if (pathMatcher.match("/products/**", path) ||
                pathMatcher.match("/categories/**", path) ||
                pathMatcher.match("/api/categories/**", path) ||
                pathMatcher.match("/api/reviews/**", path)) {
                isPublic = true;
            }
        }

        if (isPublic) {
            return chain.filter(exchange);
        }

        // 2. Authenticate secure paths
        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            return onError(exchange, "No Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "Invalid Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        if (!jwtUtils.validateToken(token)) {
            return onError(exchange, "Invalid or Expired JWT", HttpStatus.UNAUTHORIZED);
        }

        // Extract user email
        String email = jwtUtils.getUsernameFromToken(token);

        // Mutate request to add header downstream
        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Email", email)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // Run early
    }
}
