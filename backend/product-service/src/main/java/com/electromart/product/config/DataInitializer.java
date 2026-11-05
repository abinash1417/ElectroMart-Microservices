package com.electromart.product.config;

import com.electromart.product.model.Category;
import com.electromart.product.model.Product;
import com.electromart.product.repository.CategoryRepository;
import com.electromart.product.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public DataInitializer(CategoryRepository categoryRepository,
                           ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository  = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            System.out.println("✔  Products already seeded, skipping.");
            return;
        }

        // ── Categories ────────────────────────────────────────────────────────
        Category audio     = seedCategory("Audio",       "Headphones, earbuds, speakers & more");
        Category cameras   = seedCategory("Cameras",     "DSLRs, mirrorless, action cams & accessories");
        Category gaming    = seedCategory("Gaming",      "Consoles, controllers, headsets & accessories");
        Category laptops   = seedCategory("Laptops",     "Ultrabooks, gaming laptops, workstations");
        Category pcs       = seedCategory("Computers",   "Desktops, all-in-ones, mini PCs");
        Category storage   = seedCategory("Storage",     "SSDs, HDDs, USB drives, NAS devices");
        Category watches   = seedCategory("Smartwatches","Fitness trackers, smartwatches & bands");
        Category tvs       = seedCategory("TVs",         "4K, OLED, QLED, smart TVs & projectors");

        // ── Audio (au1 – au8) ─────────────────────────────────────────────────
        seedProducts(audio, List.of(
            p("Sony WH-1000XM5",         "Industry-leading noise cancelling headphones with 30-hour battery life.", 49900.0, 25, "au1.png"),
            p("Bose QuietComfort 45",     "Premium ANC headphones with clear call quality and TriPort acoustics.",  44500.0, 18, "au2.png"),
            p("JBL Tune 760NC",           "Wireless over-ear headphones with adaptive noise cancellation.",           8999.0, 40, "au3.png"),
            p("Sennheiser HD 450BT",      "Hi-fi wireless headphones with active noise cancellation and AAC.",       12500.0, 30, "au4.png"),
            p("Apple AirPods Pro 2",      "Active noise cancellation, Adaptive Transparency, spatial audio.",        24900.0, 50, "au5.png"),
            p("Samsung Galaxy Buds2 Pro", "24-bit Hi-Fi sound, intelligent ANC, ergonomic design.",                  14999.0, 35, "au6.png"),
            p("Boat Airdopes 141",        "42-hour total playback, IPX4 water resistance, BT 5.1.",                   1299.0, 80, "au7.png"),
            p("Jabra Evolve2 85",         "Professional ANC headset with superior call performance.",                34999.0, 12, "au8.png")
        ));

        // ── Cameras (ca1 – ca8) ───────────────────────────────────────────────
        seedProducts(cameras, List.of(
            p("Sony Alpha A7 IV",         "33MP full-frame mirrorless camera with 4K 60p video.",                  214900.0,  8, "ca1.png"),
            p("Canon EOS R6 Mark II",     "24.2MP mirrorless, DIGIC X processor, up to 40fps burst shooting.",    234900.0,  6, "ca2.png"),
            p("Nikon Z8",                 "45.7MP stacked BSI-CMOS, 8K RAW video, lightning autofocus.",          344900.0,  4, "ca3.png"),
            p("Fujifilm X-T5",            "40.2MP X-Trans CMOS 5 HR, in-body stabilization, retro design.",      149900.0, 10, "ca4.png"),
            p("GoPro HERO12 Black",       "5.3K60 video, HyperSmooth 6.0, waterproof to 10m.",                    39999.0, 20, "ca5.png"),
            p("DJI Pocket 3",             "4K/120fps, 1-inch CMOS, gimbal stabilization, creator combo.",          69900.0, 15, "ca6.png"),
            p("Canon EOS 1500D",          "24.1MP APS-C DSLR, Wi-Fi, NFC, beginner-friendly kit lens.",           44900.0, 22, "ca7.png"),
            p("Insta360 X4",              "8K 360 camera, active HDR, 135-min battery, waterproof.",              44999.0, 18, "ca8.png")
        ));

        // ── Gaming (ga1 – ga8) ────────────────────────────────────────────────
        seedProducts(gaming, List.of(
            p("PlayStation 5 Console",     "Next-gen gaming with SSD, 4K@120fps, DualSense haptics.",             49990.0, 10, "ga1.png"),
            p("Xbox Series X",             "4K gaming, 120fps, Quick Resume, Xbox Game Pass ready.",              49990.0, 10, "ga2.png"),
            p("Nintendo Switch OLED",      "7-inch OLED screen, enhanced audio, 64GB storage.",                   29999.0, 20, "ga3.png"),
            p("Razer DeathAdder V3",       "Ultra-lightweight gaming mouse, 30K DPI optical sensor.",              7999.0, 35, "ga4.png"),
            p("SteelSeries Arctis Nova 7", "Wireless gaming headset, 38-hr battery, ClearCast mic.",             14999.0, 25, "ga5.png"),
            p("Logitech G Pro X TKL",      "Tenkeyless gaming keyboard, hot-swappable switches, LIGHTSYNC RGB.",  12999.0, 30, "ga6.png"),
            p("Asus ROG Swift OLED 27\"",  "2560x1440 QHD OLED, 240Hz, 0.03ms response, G-Sync compatible.",    74999.0,  8, "ga7.png"),
            p("Sony PS5 DualSense Edge",   "Pro wireless controller, customizable back buttons and sticks.",      19999.0, 15, "ga8.png")
        ));

        // ── Laptops (l1 – l8) ─────────────────────────────────────────────────
        seedProducts(laptops, List.of(
            p("Apple MacBook Pro 14\" M3 Pro","M3 Pro chip, 18GB RAM, 512GB SSD, Liquid Retina XDR display.",    219900.0,  8, "l1.png"),
            p("Dell XPS 15 (2024)",          "Intel Core Ultra 9, 32GB DDR5, 1TB SSD, 3.5K OLED touch.",        174900.0,  6, "l2.png"),
            p("Lenovo ThinkPad X1 Carbon",   "Intel Core Ultra 7, 16GB, 512GB, business ultrabook 1.12kg.",      139900.0, 10, "l3.png"),
            p("HP Spectre x360 14",          "Intel Evo, OLED 2.8K touch, 2-in-1 convertible, 17-hr battery.",  124900.0, 12, "l4.png"),
            p("Asus ROG Zephyrus G14",       "AMD Ryzen 9 8945HS, RTX 4070, 1TB SSD, 165Hz OLED.",              129900.0,  9, "l5.png"),
            p("Acer Nitro V 15",             "Intel Core i5-13420H, RTX 4050, 16GB, 512GB, 144Hz FHD.",          64999.0, 18, "l6.png"),
            p("Microsoft Surface Laptop 6",  "Intel Core Ultra 5/7, 16GB, Copilot+ PC, 13.5-inch PixelSense.",   99900.0, 11, "l7.png"),
            p("Samsung Galaxy Book4 Ultra",  "Intel Core Ultra 9, RTX 4070, 16GB, 1TB, 3K AMOLED 120Hz.",       179900.0,  5, "l8.png")
        ));

        // ── Computers / PCs (pc1 – pc8) ──────────────────────────────────────
        seedProducts(pcs, List.of(
            p("Apple Mac Mini M4",         "M4 chip, 16GB, 256GB SSD, compact powerhouse for creators.",          59900.0, 14, "pc1.png"),
            p("Asus ROG Strix GT35",       "Intel Core i9, RTX 4090, 64GB DDR5, 2TB NVMe gaming desktop.",      299900.0,  4, "pc2.png"),
            p("Dell Inspiron 27 AIO",      "Intel Core i7-13700T, 16GB, 512GB, 27-inch FHD touch all-in-one.",   94999.0,  8, "pc3.png"),
            p("HP Pavilion Gaming Desktop","AMD Ryzen 7 5700G, RX 6600, 16GB, 1TB HDD + 512GB SSD.",             74999.0, 10, "pc4.png"),
            p("Intel NUC 13 Pro",          "Core i7-1360P, mini PC, Thunderbolt 4, dual 4K display support.",    64999.0, 16, "pc5.png"),
            p("Lenovo Legion Tower 5i",    "Intel Core i7-14700KF, RTX 4070 Super, 32GB, 1TB SSD.",             154900.0,  6, "pc6.png"),
            p("Mac Pro M2 Ultra",          "M2 Ultra chip, 192GB unified memory, 8TB SSD, pro workstation.",     699900.0,  2, "pc7.png"),
            p("Zotac ZBOX Magnus One",     "Intel Core i7-10700, RTX 3070, compact VR-ready gaming PC.",          94999.0,  7, "pc8.png")
        ));

        // ── Storage (st1 – st8) ───────────────────────────────────────────────
        seedProducts(storage, List.of(
            p("Samsung 990 Pro 2TB NVMe",  "PCIe 4.0 NVMe SSD, 7450MB/s read, heat management, PS5 compatible.", 16999.0, 40, "st1.png"),
            p("WD Black SN850X 1TB",       "PCIe 4.0 NVMe, 7300MB/s, gaming storage with heatsink option.",       9999.0, 35, "st2.png"),
            p("Seagate IronWolf 8TB HDD",  "NAS-optimized HDD, 7200 RPM, AgileArray technology, 3-year warranty.",14999.0, 20, "st3.png"),
            p("Kingston Fury Renegade 4TB","PCIe 4.0 NVMe M.2, 7300/7000 MB/s, with or without heatsink.",       29999.0, 15, "st4.png"),
            p("SanDisk Extreme Pro 2TB",   "Portable SSD, 2000MB/s, USB 3.2 Gen2x2, IP55 water/dust resistant.", 18999.0, 28, "st5.png"),
            p("WD Purple 4TB Surveillance","Surveillance-class HDD, AI-enabled cameras, 64 cameras support.",     9499.0, 22, "st6.png"),
            p("Samsung T7 Shield 2TB",     "Portable SSD, 1050MB/s, USB 3.2, rugged IP65 protection.",           14999.0, 30, "st7.png"),
            p("Crucial MX500 1TB SATA",    "2.5-inch SATA SSD, 560MB/s read, Micron 3D NAND, 5-year warranty.",   6499.0, 45, "st8.png")
        ));

        // ── Smartwatches (sw1 – sw8) ──────────────────────────────────────────
        seedProducts(watches, List.of(
            p("Apple Watch Series 10",     "Largest display ever, 18-hr battery, crash detection, swimproof.",    41900.0, 20, "sw1.png"),
            p("Samsung Galaxy Watch 7",    "Advanced health tracking, AI-powered coaching, Wear OS 5.",           27999.0, 25, "sw2.png"),
            p("Garmin Fenix 7X Pro Solar", "Solar charging, 37-day battery, multi-band GPS, built-in flashlight.",74999.0,  8, "sw3.png"),
            p("Fitbit Charge 6",           "Google integration, 24/7 heart rate, skin temp sensor, 7-day battery.",14999.0, 35, "sw4.png"),
            p("Amazfit GTR 4",             "1.43\" AMOLED, 150+ sports modes, 14-day battery, Alexa built-in.",    12999.0, 40, "sw5.png"),
            p("Noise ColorFit Ultra 3",    "1.78\" AMOLED, BT calling, 100+ sports modes, health suite.",          4499.0, 60, "sw6.png"),
            p("Fossil Gen 6 Wellness",     "Wear OS, SpO2, heart rate, rapid charging, classic design.",          19999.0, 18, "sw7.png"),
            p("Apple Watch Ultra 2",       "Titanium case, 60-hr battery, dual-frequency GPS, action button.",    89900.0,  6, "sw8.png")
        ));

        // ── TVs (tv1 – tv8) ───────────────────────────────────────────────────
        seedProducts(tvs, List.of(
            p("LG C3 55\" OLED evo",       "4K OLED evo, a9 AI Processor Gen6, Dolby Vision, 120Hz, webOS.",     104999.0,  7, "tv1.png"),
            p("Samsung QN85 Neo QLED 65\"","4K Neo QLED, Quantum Matrix, Neural Quantum Processor, Dolby Atmos.", 129999.0,  5, "tv2.png"),
            p("Sony Bravia XR A80L 55\"",  "4K OLED, Cognitive Processor XR, Perfect for PS5, Dolby Vision.",    124999.0,  6, "tv3.png"),
            p("OnePlus TV 55 Q2 Pro",      "4K QLED, 144Hz, HDMI 2.1, Dolby Vision IQ + Dolby Atmos.",           54999.0, 12, "tv4.png"),
            p("MI QLED TV 4K 75\"",        "75-inch 4K QLED, Vivid Picture Engine Pro, far-field voice control.",  84999.0,  8, "tv5.png"),
            p("TCL 65\" C745 QLED",        "4K QD-Mini LED, Google TV, hands-free voice, 144Hz VRR, HDMI 2.1.",    69999.0, 10, "tv6.png"),
            p("Hisense 85\" U8K Mini-LED", "144Hz, Mini-LED, Dolby Vision, IMAX Enhanced, Game Mode Pro.",        144999.0,  4, "tv7.png"),
            p("Vu 4K Cinema TV 65\"",      "4K HDR, 40W Dolby Atmos, Quantum Luminit, 3-year panel warranty.",     44999.0, 15, "tv8.png")
        ));

        System.out.println("✔  Seeded 64 products across 8 categories.");
    }

    private Category seedCategory(String name, String description) {
        return categoryRepository.findByName(name)
                .orElseGet(() -> categoryRepository.save(
                        Category.builder().name(name).description(description).build()));
    }

    private void seedProducts(Category category, List<Product> products) {
        products.forEach(p -> p.setCategory(category));
        productRepository.saveAll(products);
    }

    private Product p(String name, String description, Double price, Integer stock, String image) {
        return Product.builder()
                .name(name)
                .description(description)
                .price(price)
                .stock(stock)
                .frontImage(image)
                .build();
    }
}
