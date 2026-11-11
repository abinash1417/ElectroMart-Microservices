package com.electromart.ai.service;

import com.electromart.ai.client.ProductClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiService {

    @Value("${groq.api.key:}")
    private String groqApiKey;

    private final ProductClient productClient;
    private final RestTemplate restTemplate;

    public AiService(ProductClient productClient) {
        this.productClient = productClient;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(6000);
        factory.setReadTimeout(12000);
        this.restTemplate = new RestTemplate(factory);
    }

    public String chat(String userMessage) {
        // 1. Fetch products safely for context
        List<Map<String, Object>> products = fetchProductsSafely();

        StringBuilder productContext = new StringBuilder();
        for (Map<String, Object> p : products) {
            String catName = extractCategoryName(p.get("category"));
            productContext.append("- ")
                    .append(p.get("name"))
                    .append(", Category: ").append(catName)
                    .append(", Price: Rs.").append(p.get("price"))
                    .append(", Stock: ").append(p.get("stock"))
                    .append("\n");
        }

        // 2. Attempt Groq API if key is configured
        if (groqApiKey != null && !groqApiKey.isBlank() && !groqApiKey.contains("CHANGE_ME")) {
            try {
                String systemPrompt = "You are ElectroBot, a friendly AI assistant for ElectroMart electronics store. "
                        + "Help customers find products, compare items, guide on orders, cart, shipping and returns. "
                        + (productContext.length() > 0 ? "Current products in stock:\n" + productContext : "")
                        + "Be concise, friendly and helpful. Mention product names and prices when recommending.";

                Map<String, String> systemMsg = new HashMap<>();
                systemMsg.put("role", "system");
                systemMsg.put("content", systemPrompt);

                Map<String, String> userMsg = new HashMap<>();
                userMsg.put("role", "user");
                userMsg.put("content", userMessage);

                Map<String, Object> body = new HashMap<>();
                body.put("model", "llama-3.3-70b-versatile");
                body.put("messages", List.of(systemMsg, userMsg));
                body.put("max_tokens", 450);
                body.put("temperature", 0.7);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(groqApiKey.trim());

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

                ResponseEntity<Map> response = restTemplate.postForEntity(
                        "https://api.groq.com/openai/v1/chat/completions",
                        request,
                        Map.class
                );

                if (response.getBody() != null && response.getBody().containsKey("choices")) {
                    List<Map> choices = (List<Map>) response.getBody().get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map message = (Map) choices.get(0).get("message");
                        if (message != null && message.get("content") != null) {
                            return (String) message.get("content");
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Notice: Groq API call failed (" + e.getMessage() + "), using intelligent internal assistant fallback.");
            }
        }

        // 3. Fallback: Intelligent internal rule/catalog response
        return generateLocalChatResponse(userMessage, products);
    }

    public String compareProducts(List<Map<String, Object>> products) {
        if (products == null || products.isEmpty()) {
            return "Please select at least 2 products to compare.";
        }

        StringBuilder productInfo = new StringBuilder();
        for (Map<String, Object> p : products) {
            String catName = extractCategoryName(p.get("category"));
            productInfo.append("Product: ").append(p.get("name"))
                    .append(" | Category: ").append(catName)
                    .append(" | Price: Rs.").append(p.get("price"))
                    .append(" | Stock: ").append(p.get("stock"))
                    .append(" | Description: ").append(p.get("description"))
                    .append("\n");
        }

        // Attempt Groq API if key is configured
        if (groqApiKey != null && !groqApiKey.isBlank() && !groqApiKey.contains("CHANGE_ME")) {
            try {
                String prompt = "You are ElectroBot, an expert electronics advisor at ElectroMart.\n\n"
                        + "Compare these products for the customer:\n\n"
                        + productInfo
                        + "\nProvide:\n"
                        + "1. Key differences between the products\n"
                        + "2. Which product is best for different types of users\n"
                        + "3. Your final recommendation with clear reasoning\n"
                        + "Be concise, friendly and helpful. Use bullet points where needed.";

                Map<String, String> systemMsg = new HashMap<>();
                systemMsg.put("role", "system");
                systemMsg.put("content", "You are ElectroBot, a smart electronics advisor. Give clear, helpful product comparisons.");

                Map<String, String> userMsg = new HashMap<>();
                userMsg.put("role", "user");
                userMsg.put("content", prompt);

                Map<String, Object> body = new HashMap<>();
                body.put("model", "llama-3.3-70b-versatile");
                body.put("messages", List.of(systemMsg, userMsg));
                body.put("max_tokens", 650);
                body.put("temperature", 0.7);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(groqApiKey.trim());

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

                ResponseEntity<Map> response = restTemplate.postForEntity(
                        "https://api.groq.com/openai/v1/chat/completions",
                        request,
                        Map.class
                );

                if (response.getBody() != null && response.getBody().containsKey("choices")) {
                    List<Map> choices = (List<Map>) response.getBody().get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map message = (Map) choices.get(0).get("message");
                        if (message != null && message.get("content") != null) {
                            return (String) message.get("content");
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Notice: Groq comparison failed (" + e.getMessage() + "), using intelligent internal comparison.");
            }
        }

        // Fallback: Structured built-in comparison
        return generateLocalComparison(products);
    }

    private List<Map<String, Object>> fetchProductsSafely() {
        try {
            List<Map<String, Object>> list = productClient.getAllProducts();
            return list != null ? list : Collections.emptyList();
        } catch (Exception ex) {
            System.err.println("Warning: Unable to fetch products from product-service: " + ex.getMessage());
            return Collections.emptyList();
        }
    }

    private String extractCategoryName(Object catObj) {
        if (catObj instanceof Map<?, ?> catMap && catMap.get("name") != null) {
            return catMap.get("name").toString();
        } else if (catObj instanceof String catStr) {
            return catStr;
        }
        return "N/A";
    }

    private String generateLocalChatResponse(String query, List<Map<String, Object>> products) {
        String lower = query.toLowerCase().trim();

        // 1. Budget extraction (e.g. under 50000, below 100000)
        Double budget = null;
        Pattern p = Pattern.compile("(?:under|below|less than|budget of)?\\s*(?:rs\\.?|lkr)?\\s*(\\d{3,7})", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(lower);
        if (m.find()) {
            try {
                budget = Double.parseDouble(m.group(1));
            } catch (Exception ignored) {}
        }

        // 2. Filter matching products from store catalog
        List<Map<String, Object>> matches = new ArrayList<>();
        for (Map<String, Object> prod : products) {
            String name = String.valueOf(prod.getOrDefault("name", "")).toLowerCase();
            String cat = extractCategoryName(prod.get("category")).toLowerCase();
            String desc = String.valueOf(prod.getOrDefault("description", "")).toLowerCase();

            boolean matchesKeywords = lower.contains("phone") && (cat.contains("phone") || name.contains("phone") || name.contains("galaxy") || name.contains("apple"))
                    || lower.contains("laptop") && (cat.contains("laptop") || name.contains("macbook") || name.contains("dell") || name.contains("thinkpad") || name.contains("zephyrus") || name.contains("nitro"))
                    || lower.contains("headphone") && (cat.contains("audio") || name.contains("wh-1000xm5") || name.contains("bose") || name.contains("airpods"))
                    || lower.contains("tv") && (cat.contains("tv") || name.contains("oled") || name.contains("qled"))
                    || lower.contains("camera") && (cat.contains("camera") || name.contains("sony") || name.contains("canon") || name.contains("nikon") || name.contains("gopro"))
                    || lower.contains("watch") && (cat.contains("watch") || name.contains("watch") || name.contains("garmin") || name.contains("fitbit"))
                    || lower.contains("gaming") && (cat.contains("gaming") || name.contains("ps5") || name.contains("xbox") || name.contains("switch"))
                    || lower.contains("audio") && cat.contains("audio")
                    || (name.contains(lower) || desc.contains(lower));

            if (matchesKeywords) {
                if (budget != null) {
                    try {
                        double price = Double.parseDouble(prod.get("price").toString());
                        if (price <= budget) {
                            matches.add(prod);
                        }
                    } catch (Exception ignored) {}
                } else {
                    matches.add(prod);
                }
            }
        }

        // If specific products found in catalog
        if (!matches.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            sb.append("⚡ **ElectroBot Recommendations:**\n\n");
            int count = 0;
            for (Map<String, Object> item : matches) {
                if (++count > 4) break;
                sb.append("• **").append(item.get("name")).append("** — Rs. ").append(item.get("price"))
                        .append(" (").append(item.get("stock")).append(" in stock)\n  ")
                        .append(item.get("description")).append("\n\n");
            }
            sb.append("Feel free to add any of these to your cart or compare them directly!");
            return sb.toString();
        }

        // Store policy / FAQ replies
        if (lower.contains("order") || lower.contains("track")) {
            return "📦 You can track your existing orders anytime in your **Profile** page under 'My Orders'. We update status in real time!";
        }
        if (lower.contains("deliver") || lower.contains("ship")) {
            return "🚚 ElectroMart delivers islandwide within 2-3 business days. Free delivery on orders over Rs. 10,000!";
        }
        if (lower.contains("return") || lower.contains("refund")) {
            return "↩️ We offer hassle-free 7-day returns for defective or damaged items. Contact support via our Contact page to initiate a return.";
        }
        if (lower.contains("pay") || lower.contains("card")) {
            return "💳 We support Visa, MasterCard, Debit Cards, and secure online checkout.";
        }

        return "⚡ Hello! I'm **ElectroBot**, your ElectroMart shopping assistant.\n\n"
                + "I can help you find products, compare specs, check prices, and recommend items within your budget!\n\n"
                + "Try asking:\n"
                + "• *'Best laptops under 150000'*\n"
                + "• *'Top noise-cancelling headphones'*\n"
                + "• *'Compare 4K TVs'*";
    }

    private String generateLocalComparison(List<Map<String, Object>> products) {
        StringBuilder sb = new StringBuilder();
        sb.append("⚡ **ElectroBot Side-by-Side Comparison**\n\n");

        sb.append("### 📊 Overview:\n");
        for (Map<String, Object> p : products) {
            String name = String.valueOf(p.getOrDefault("name", "Product"));
            String cat = extractCategoryName(p.get("category"));
            Object price = p.getOrDefault("price", "N/A");
            Object stock = p.getOrDefault("stock", 0);
            sb.append("• **").append(name).append("** | Category: ").append(cat)
                    .append(" | Price: **Rs. ").append(price).append("** | Stock: ").append(stock).append(" units\n");
        }

        sb.append("\n### 🔍 Key Features:\n");
        for (Map<String, Object> p : products) {
            String name = String.valueOf(p.getOrDefault("name", "Product"));
            String desc = String.valueOf(p.getOrDefault("description", "Premium electronics item"));
            sb.append("• **").append(name).append("**: ").append(desc).append("\n");
        }

        sb.append("\n### 🎯 ElectroBot's Recommendation:\n");
        if (products.size() >= 2) {
            try {
                Map<String, Object> p1 = products.get(0);
                Map<String, Object> p2 = products.get(1);
                double price1 = Double.parseDouble(p1.get("price").toString());
                double price2 = Double.parseDouble(p2.get("price").toString());

                if (price1 < price2) {
                    sb.append("• **Best Value**: Choose **").append(p1.get("name"))
                            .append("** to save Rs. ").append(String.format("%.0f", (price2 - price1)))
                            .append(" while still getting outstanding features.\n");
                    sb.append("• **Premium Pick**: Choose **").append(p2.get("name"))
                            .append("** if you want top-tier performance and flagship capabilities.");
                } else if (price2 < price1) {
                    sb.append("• **Best Value**: Choose **").append(p2.get("name"))
                            .append("** to save Rs. ").append(String.format("%.0f", (price1 - price2)))
                            .append(" while still getting great performance.\n");
                    sb.append("• **Premium Pick**: Choose **").append(p1.get("name"))
                            .append("** if you want the ultimate flagship experience.");
                } else {
                    sb.append("• Both products are priced identically at Rs. ").append(price1)
                            .append(". Pick the one whose design and features best match your personal setup!");
                }
            } catch (Exception e) {
                sb.append("• Both are excellent choices in their respective categories. Choose according to your specific daily usage requirements!");
            }
        }

        return sb.toString();
    }
}