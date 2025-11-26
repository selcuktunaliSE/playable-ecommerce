import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "../models/category";
import Product from "../models/product";
import User from "../models/user";
import Order from "../models/order";

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in env.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB:", uri);
  await mongoose.connect(uri);
  console.log("✅ Connected");

  console.log(
    "Clearing collections (categories, products, selected users, orders)..."
  );

  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    User.deleteMany({}),
    Order.deleteMany({})
  ]);

  console.log("Seeding categories...");
  const categories = await Category.insertMany([
    { name: "Headphones", slug: "headphones" },
    { name: "Earbuds", slug: "earbuds" },
    { name: "Laptops", slug: "laptops" },
    { name: "Keyboards & Mice", slug: "keyboards-mice" },
    { name: "Monitors", slug: "monitors" },
    { name: "Smartphones", slug: "smartphones" }
  ]);

  const catBySlug: Record<string, any> = {};
  for (const c of categories) {
    catBySlug[c.slug] = c._id;
  }

  console.log("Seeding products (15 items)...");
  const products = await Product.insertMany([
    // 1. Sony WH-1000XM5 (Siparişlerde: 2 adet)
    {
      name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
      slug: "sony-wh-1000xm5",
      description:
        "Premium over-ear wireless headphones with industry-leading noise cancelling.\n- Two processors control 8 microphones\n- Auto NC Optimizer\n- Up to 30 hours battery life",
      images: [
        "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 399,
      stock: 25,
      category: catBySlug["headphones"],
      rating: 4.9,
      numReviews: 45,
      isActive: true,
      salesCount: 2, 
      options: [
        {
          name: "Color",
          values: [
            { value: "Black", priceDelta: 0 },
            { value: "Platinum Silver", priceDelta: 0 }
          ]
        }
      ]
    },
    // 2. Apple AirPods Pro 2 (Siparişlerde: 0 adet)
    {
      name: "Apple AirPods Pro (2nd generation) with MagSafe Case",
      slug: "apple-airpods-pro-2nd-gen",
      description:
        "True wireless earbuds with active noise cancellation.\n- H2 Apple Silicon\n- Personalized Spatial Audio\n- MagSafe charging case",
      images: [
        "https://images.unsplash.com/photo-1603351154351-5cf99bc5f16d?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1628210889224-53b2e308bb46?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1588156979435-379b9d802b74?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 249,
      stock: 40,
      category: catBySlug["earbuds"],
      rating: 4.5,
      numReviews: 120,
      isActive: true,
      salesCount: 0,
      options: []
    },
    // 3. Logitech MX Master 3S (Siparişlerde: 3+2+1 = 6 adet)
    {
      name: "Logitech MX Master 3S Wireless Mouse",
      slug: "logitech-mx-master-3s",
      description:
        "An icon remastered for creators.\n- Quiet Clicks\n- 8K DPI optical sensor\n- MagSpeed electromagnetic scrolling",
      images: [
        "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 119,
      stock: 50,
      category: catBySlug["keyboards-mice"],
      rating: 4.7,
      numReviews: 230,
      isActive: true,
      salesCount: 6,
      options: [
        {
          name: "Color",
          values: [
            { value: "Graphite", priceDelta: 0 },
            { value: "Pale Grey", priceDelta: 0 }
          ]
        }
      ]
    },
    // 4. Keychron K2 (Siparişlerde: 1 adet)
    {
      name: "Keychron K2 Wireless Mechanical Keyboard",
      slug: "keychron-k2-wireless-mechanical-keyboard",
      description:
        "The best combination of full-sized and tenkeyless keyboard.\n- Bluetooth 5.1\n- 4000 mAh battery\n- Gateron G Pro Switches",
      images: [
        "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1587829741301-dc798b91add1?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 89,
      stock: 35,
      category: catBySlug["keyboards-mice"],
      rating: 5.0,
      numReviews: 25,
      isActive: true,
      salesCount: 1,
      options: [
        {
          name: "Switch Type",
          values: [
            { value: "Red (Linear)", priceDelta: 0 },
            { value: "Blue (Clicky)", priceDelta: 0 },
            { value: "Brown (Tactile)", priceDelta: 0 }
          ]
        },
        {
          name: "Backlight",
          values: [
            { value: "White LED", priceDelta: 0 },
            { value: "RGB Aluminum Frame", priceDelta: 20 }
          ]
        }
      ]
    },
    // 5. Dell XPS 13 (Siparişlerde: 1 adet)
    {
      name: 'Dell XPS 13 13.4" FHD+ Laptop',
      slug: "dell-xps-13-plus",
      description:
        "Twice as powerful as before in the same size.\n- 12th Gen Intel Core\n- InfinityEdge display\n- CNC machined aluminum",
      images: [
        "https://images.unsplash.com/photo-1593642632823-8f78536788c6?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 1399,
      stock: 15,
      category: catBySlug["laptops"],
      rating: 4.2,
      numReviews: 18,
      isActive: true,
      salesCount: 1,
      options: [
        {
          name: "Processor",
          values: [
            { value: "Intel Core i5", priceDelta: 0 },
            { value: "Intel Core i7", priceDelta: 300 }
          ]
        },
        {
          name: "RAM",
          values: [
            { value: "16GB", priceDelta: 0 },
            { value: "32GB", priceDelta: 200 }
          ]
        }
      ]
    },
    // 6. MacBook Air M2 (Siparişlerde: 1 adet)
    {
      name: 'Apple MacBook Air 13" (M2 Chip)',
      slug: "macbook-air-13-m2-midnight",
      description:
        "Supercharged by M2.\n- Strikingly thin design\n- Up to 18 hours battery\n- Liquid Retina display",
      images: [
        "https://images.unsplash.com/photo-1699393393043-44f0795c80ce?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 1199,
      stock: 20,
      category: catBySlug["laptops"],
      rating: 4.8,
      numReviews: 50,
      isActive: true,
      salesCount: 1,
      options: [
        {
          name: "Color",
          values: [
            { value: "Midnight", priceDelta: 0 },
            { value: "Silver", priceDelta: 0 },
            { value: "Starlight", priceDelta: 0 }
          ]
        },
        {
          name: "Storage",
          values: [
            { value: "256GB SSD", priceDelta: 0 },
            { value: "512GB SSD", priceDelta: 200 }
          ]
        }
      ]
    },
    // 7. Samsung Odyssey G5 (Siparişlerde: 2 adet)
    {
      name: 'Samsung Odyssey G5 27" QHD 144Hz Monitor',
      slug: "samsung-odyssey-g5-27-qhd-144hz",
      description:
        "Go beyond.\n- 1000R Curved Screen\n- WQHD resolution\n- 144Hz refresh rate & 1ms response",
      images: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542393545-facac42e67ee?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551645120-d70bfe84c826?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 329,
      stock: 18,
      category: catBySlug["monitors"],
      rating: 4.3,
      numReviews: 22,
      isActive: true,
      salesCount: 2,
      options: []
    },
    // 8. iPhone 15 (Siparişlerde: 1 adet)
    {
      name: "Apple iPhone 15",
      slug: "apple-iphone-15",
      description:
        "New camera. New design.\n- Dynamic Island\n- 48MP Main camera\n- USB-C connector",
      images: [
        "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 799,
      stock: 30,
      category: catBySlug["smartphones"],
      rating: 4.6,
      numReviews: 180,
      isActive: true,
      salesCount: 1,
      options: [
        {
          name: "Color",
          values: [
            { value: "Black", priceDelta: 0 },
            { value: "Blue", priceDelta: 0 },
            { value: "Pink", priceDelta: 0 },
            { value: "Yellow", priceDelta: 0 }
          ]
        },
        {
          name: "Storage",
          values: [
            { value: "128GB", priceDelta: 0 },
            { value: "256GB", priceDelta: 100 },
            { value: "512GB", priceDelta: 300 }
          ]
        }
      ]
    },
    // 9. Samsung S24 (Siparişlerde: 0 adet)
    {
      name: "Samsung Galaxy S24",
      slug: "samsung-galaxy-s24",
      description:
        "Galaxy AI is here.\n- Circle to Search\n- Vapor Chamber cooling\n- Armor Aluminum 2.0",
      images: [
        "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1707926105790-255d6447817e?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff23?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 799,
      stock: 28,
      category: catBySlug["smartphones"],
      rating: 4.5,
      numReviews: 90,
      isActive: true,
      salesCount: 0,
      options: [
        {
          name: "Color",
          values: [
            { value: "Onyx Black", priceDelta: 0 },
            { value: "Marble Gray", priceDelta: 0 },
            { value: "Cobalt Violet", priceDelta: 0 }
          ]
        },
        {
          name: "Storage",
          values: [
            { value: "128GB", priceDelta: 0 },
            { value: "256GB", priceDelta: 60 }
          ]
        }
      ]
    },
    // 10. Bose QC45 (Siparişlerde: 1 adet)
    {
      name: "Bose QuietComfort 45 Wireless Headphones",
      slug: "bose-quietcomfort-45",
      description:
        "Iconic quiet. Comfort. And sound.\n- World-class noise cancelling\n- High-fidelity audio\n- Lightweight",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1487215078519-e21cc028d4e3?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 329,
      stock: 22,
      category: catBySlug["headphones"],
      rating: 4.4,
      numReviews: 65,
      isActive: true,
      salesCount: 1,
      options: [
        {
          name: "Color",
          values: [
            { value: "Triple Black", priceDelta: 0 },
            { value: "White Smoke", priceDelta: 0 }
          ]
        }
      ]
    },
    // 11. SteelSeries Arctis Nova 7 (Siparişlerde: 1 adet)
    {
      name: "SteelSeries Arctis Nova 7 Wireless Gaming Headset",
      slug: "steelseries-arctis-nova-7",
      description:
        "Almighty Audio.\n- 360° Spatial Audio\n- Simultaneous Wireless (2.4GHz + Bluetooth)\n- 38-hour battery",
      images: [
        "https://images.unsplash.com/photo-1588691866300-84882c892b1a?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1610609384594-52d80d220806?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 179,
      stock: 27,
      category: catBySlug["headphones"],
      rating: 4.1,
      numReviews: 35,
      isActive: true,
      salesCount: 1,
      options: []
    },
    // 12. Samsung Galaxy Buds2 Pro (Siparişlerde: 2 adet)
    {
      name: "Samsung Galaxy Buds2 Pro",
      slug: "samsung-galaxy-buds2-pro",
      description:
        "Hi-Fi sound in your ear.\n- 24-bit Hi-Fi audio\n- Intelligent 360 Audio\n- Active Noise Canceling",
      images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1627918356942-5f6b83f36467?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1652532560548-c84cb6302526?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 199,
      stock: 32,
      category: catBySlug["earbuds"],
      rating: 4.4,
      numReviews: 55,
      isActive: true,
      salesCount: 2,
      options: [
        {
          name: "Color",
          values: [
            { value: "Graphite", priceDelta: 0 },
            { value: "White", priceDelta: 0 },
            { value: "Bora Purple", priceDelta: 0 }
          ]
        }
      ]
    },
    // 13. Sony WF-1000XM5 (Siparişlerde: 2+1=3 adet)
    {
      name: "Sony WF-1000XM5 True Wireless Earbuds",
      slug: "sony-wf-1000xm5",
      description:
        "The Best Noise Cancelling Earbuds.\n- Specially designed driver\n- Small and light\n- Bone conduction sensors",
      images: [
        "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1627989580309-bfaf3e58af6f?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618418042571-7da340156d95?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 299,
      stock: 26,
      category: catBySlug["earbuds"],
      rating: 4.8,
      numReviews: 40,
      isActive: true,
      salesCount: 3,
      options: [
        {
          name: "Color",
          values: [
            { value: "Black", priceDelta: 0 },
            { value: "Silver", priceDelta: 0 }
          ]
        }
      ]
    },
    // 14. Logitech G Pro X Superlight (Siparişlerde: 1 adet)
    {
      name: "Logitech G Pro X Superlight Wireless Mouse",
      slug: "logitech-g-pro-x-superlight",
      description:
        "Remove all obstacles.\n- Less than 63 grams\n- HERO 25K Sensor\n- Zero-additive PTFE Feet",
      images: [
        "https://images.unsplash.com/photo-1605773527852-c546a8584ea3?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1586349906660-84a222883c38?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 159,
      stock: 40,
      category: catBySlug["keyboards-mice"],
      rating: 4.9,
      numReviews: 75,
      isActive: true,
      salesCount: 1,
      options: [
        {
          name: "Color",
          values: [
            { value: "Black", priceDelta: 0 },
            { value: "White", priceDelta: 0 },
            { value: "Magenta", priceDelta: 0 }
          ]
        }
      ]
    },
    // 15. Razer Huntsman Mini (Siparişlerde: 1 adet)
    {
      name: "Razer Huntsman Mini 60% Gaming Keyboard",
      slug: "razer-huntsman-mini",
      description:
        "Dominance on a different scale.\n- Razer Optical Switches\n- 60% Form Factor\n- Doubleshot PBT Keycaps",
      images: [
        "https://images.unsplash.com/photo-1626075677028-2bb133d5df01?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1000&auto=format&fit=crop"
      ],
      price: 129,
      stock: 38,
      category: catBySlug["keyboards-mice"],
      rating: 4.7,
      numReviews: 28,
      isActive: true,
      salesCount: 1,
      options: [
        {
          name: "Switch Type",
          values: [
            { value: "Clicky Optical (Purple)", priceDelta: 0 },
            { value: "Linear Optical (Red)", priceDelta: 10 }
          ]
        },
        {
          name: "Color",
          values: [
            { value: "Black", priceDelta: 0 },
            { value: "Mercury White", priceDelta: 0 }
          ]
        }
      ]
    }
  ]);

  const [
    pSonyXM5,
    pAirPodsPro2,
    pMxMaster3S,
    pKeychronK2,
    pDellXps13,
    pMacbookAirM2,
    pOdysseyG5,
    pIphone15,
    pGalaxyS24,
    pBoseQC45,
    pSteelSeries,
    pBuds2Pro,
    pSonyWF,
    pGProX,
    pHuntsman
  ] = products;

  const passwordHash =
    "$2b$10$Q7XaclnXHtMxDNAXz.DiVOZin8nF0SEqMd1YCvxzCV1H6P11VP67K";

  console.log("Seeding users (1 Admin + 5 Customers)...");
  
  const [adminUser, user1, user2, user3, user4, user5] = await User.insertMany([
    {
      name: "Super Admin",
      email: "admin@test.com",
      passwordHash,
      role: "admin"
    },
    {
      name: "Test User",
      email: "user@test.com",
      passwordHash,
      role: "customer"
    },
    {
      name: "Alice Johnson",
      email: "alice@test.com",
      passwordHash,
      role: "customer"
    },
    {
      name: "Bob Smith",
      email: "bob@test.com",
      passwordHash,
      role: "customer"
    },
    {
      name: "Charlie Brown",
      email: "charlie@test.com",
      passwordHash,
      role: "customer"
    },
    {
      name: "David Wilson",
      email: "david@test.com",
      passwordHash,
      role: "customer"
    }
  ]);

  console.log("Seeding diverse orders (12 total, varied statuses and dates)...");

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  const rawOrders = [
    {
      user: user1._id,
      items: [
        {
          product: pSonyXM5._id,
          name: pSonyXM5.name,
          price: pSonyXM5.price,
          quantity: 2,
          image: pSonyXM5.images[0],
          options: [{ name: "Color", value: "Black" }]
        }
      ],
      shippingAddress: {
        fullName: "Test User",
        addressLine1: "123 Main St",
        city: "Istanbul",
        postalCode: "34000",
        country: "Turkey"
      },
      paymentStatus: "paid",
      status: "pending",
      createdAt: daysAgo(1)
    },
    {
      user: user2._id,
      items: [
        {
          product: pGProX._id,
          name: pGProX.name,
          price: pGProX.price,
          quantity: 1,
          image: pGProX.images[2],
          options: [{ name: "Color", value: "Magenta" }]
        }
      ],
      shippingAddress: {
        fullName: "Alice Johnson",
        addressLine1: "456 Park Ave",
        city: "New York",
        postalCode: "10001",
        country: "USA"
      },
      paymentStatus: "failed",
      status: "pending",
      createdAt: daysAgo(3)
    },
    {
      user: adminUser._id,
      items: [
        {
          product: pMxMaster3S._id,
          name: pMxMaster3S.name,
          price: pMxMaster3S.price,
          quantity: 3,
          image: pMxMaster3S.images[0],
          options: [{ name: "Color", value: "Graphite" }]
        }
      ],
      shippingAddress: {
        fullName: "Admin Office",
        addressLine1: "Tech Park Block B",
        city: "San Francisco",
        postalCode: "94107",
        country: "USA"
      },
      paymentStatus: "paid",
      status: "processing",
      createdAt: daysAgo(2)
    },
    {
      user: user3._id,
      items: [
        {
          product: pIphone15._id,
          name: pIphone15.name,
          price: pIphone15.price + 100,
          quantity: 1,
          image: pIphone15.images[1],
          options: [
            { name: "Color", value: "Blue" },
            { name: "Storage", value: "256GB" }
          ]
        },
        {
          product: pBuds2Pro._id,
          name: pBuds2Pro.name,
          price: pBuds2Pro.price,
          quantity: 2,
          image: pBuds2Pro.images[0],
          options: [{ name: "Color", value: "Bora Purple" }]
        }
      ],
      shippingAddress: {
        fullName: "Bob Smith",
        addressLine1: "789 Oxford St",
        city: "London",
        postalCode: "W1D 1AA",
        country: "United Kingdom"
      },
      paymentStatus: "paid",
      status: "shipped",
      createdAt: daysAgo(10)
    },
    {
      user: user5._id,
      items: [
        {
          product: pSonyWF._id,
          name: pSonyWF.name,
          price: pSonyWF.price,
          quantity: 2,
          image: pSonyWF.images[0],
          options: [{ name: "Color", value: "Black" }]
        }
      ],
      shippingAddress: {
        fullName: "David Wilson",
        addressLine1: "202 Champs Elysees",
        city: "Paris",
        postalCode: "75008",
        country: "France"
      },
      paymentStatus: "paid",
      status: "shipped",
      createdAt: daysAgo(12)
    },
    {
      user: user4._id,
      items: [
        {
          product: pHuntsman._id,
          name: pHuntsman.name,
          price: pHuntsman.price,
          quantity: 1,
          image: pHuntsman.images[0],
          options: [
            { name: "Switch Type", value: "Linear Optical (Red)" },
            { name: "Color", value: "Mercury White" }
          ]
        }
      ],
      shippingAddress: {
        fullName: "Charlie Brown",
        addressLine1: "101 Berlin Wall",
        city: "Berlin",
        postalCode: "10115",
        country: "Germany"
      },
      paymentStatus: "refunded",
      status: "cancelled",
      createdAt: daysAgo(20)
    },
    {
      user: user5._id,
      items: [
        {
          product: pMacbookAirM2._id,
          name: pMacbookAirM2.name,
          price: pMacbookAirM2.price + 200, 
          quantity: 1,
          image: pMacbookAirM2.images[0],
          options: [
            { name: "Color", value: "Midnight" },
            { name: "Storage", value: "512GB SSD" }
          ]
        }
      ],
      shippingAddress: {
        fullName: "David Wilson",
        addressLine1: "202 Champs Elysees",
        city: "Paris",
        postalCode: "75008",
        country: "France"
      },
      paymentStatus: "paid",
      status: "delivered",
      createdAt: daysAgo(25)
    },
    {
      user: user1._id,
      items: [
        {
          product: pDellXps13._id,
          name: pDellXps13.name,
          price: pDellXps13.price + 500,
          quantity: 1,
          image: pDellXps13.images[0],
          options: [
            { name: "Processor", value: "Intel Core i7" },
            { name: "RAM", value: "32GB" }
          ]
        },
        {
          product: pMxMaster3S._id,
          name: pMxMaster3S.name,
          price: pMxMaster3S.price,
          quantity: 2,
          image: pMxMaster3S.images[0],
          options: [{ name: "Color", value: "Graphite" }]
        }
      ],
      shippingAddress: {
        fullName: "Test User",
        addressLine1: "123 Main St",
        city: "Istanbul",
        postalCode: "34000",
        country: "Turkey"
      },
      paymentStatus: "paid",
      status: "delivered",
      createdAt: daysAgo(120)
    },
    {
      user: user2._id,
      items: [
        {
          product: pBoseQC45._id,
          name: pBoseQC45.name,
          price: pBoseQC45.price,
          quantity: 1,
          image: pBoseQC45.images[1],
          options: [{ name: "Color", value: "White Smoke" }]
        }
      ],
      shippingAddress: {
        fullName: "Alice Johnson",
        addressLine1: "456 Park Ave",
        city: "New York",
        postalCode: "10001",
        country: "USA"
      },
      paymentStatus: "refunded",
      status: "cancelled",
      createdAt: daysAgo(90)
    },
    {
      user: user3._id,
      items: [
        {
          product: pKeychronK2._id,
          name: pKeychronK2.name,
          price: pKeychronK2.price + 20,
          quantity: 1,
          image: pKeychronK2.images[2],
          options: [
            { name: "Switch Type", value: "Brown (Tactile)" },
            { name: "Backlight", value: "RGB Aluminum Frame" }
          ]
        },
        {
          product: pOdysseyG5._id,
          name: pOdysseyG5.name,
          price: pOdysseyG5.price,
          quantity: 2,
          image: pOdysseyG5.images[0],
          options: []
        }
      ],
      shippingAddress: {
        fullName: "Bob Smith",
        addressLine1: "789 Oxford St",
        city: "London",
        postalCode: "W1D 1AA",
        country: "United Kingdom"
      },
      paymentStatus: "paid",
      status: "delivered",
      createdAt: daysAgo(270)
    },
    {
      user: user2._id,
      items: [
        {
          product: pSonyWF._id,
          name: pSonyWF.name,
          price: pSonyWF.price,
          quantity: 1,
          image: pSonyWF.images[2],
          options: [{ name: "Color", value: "Silver" }]
        }
      ],
      shippingAddress: {
        fullName: "Alice Johnson",
        addressLine1: "456 Park Ave",
        city: "New York",
        postalCode: "10001",
        country: "USA"
      },
      paymentStatus: "paid",
      status: "processing",
      createdAt: daysAgo(280)
    },
    {
      user: user4._id,
      items: [
        {
          product: pSteelSeries._id,
          name: pSteelSeries.name,
          price: pSteelSeries.price,
          quantity: 1,
          image: pSteelSeries.images[0],
          options: []
        },
        {
          product: pMxMaster3S._id,
          name: pMxMaster3S.name,
          price: pMxMaster3S.price,
          quantity: 1,
          image: pMxMaster3S.images[0],
          options: [{ name: "Color", value: "Graphite" }]
        }
      ],
      shippingAddress: {
        fullName: "Charlie Brown",
        addressLine1: "101 Berlin Wall",
        city: "Berlin",
        postalCode: "10115",
        country: "Germany"
      },
      paymentStatus: "paid",
      status: "delivered",
      createdAt: daysAgo(300)
    }
  ];

  const ordersToInsert = rawOrders.map((o) => {
    const _id = new mongoose.Types.ObjectId();
    
    const subtotal = o.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    const country = o.shippingAddress.country;
    let shippingFee = 15;
    if (country === "Turkey" || country === "Türkiye") {
      shippingFee = 5;
    } else if (["Germany", "France", "Spain", "Italy", "UK", "United Kingdom"].includes(country)) {
      shippingFee = 10;
    }

    const tax = subtotal * 0.18;
    const totalAmount = subtotal + shippingFee + tax;

    return {
      ...o,
      _id: _id,
      shortCode: _id.toString().slice(-6),
      totalAmount: totalAmount,
      paymentInfo: {
        method: "card",
        last4: "4242"
      }
    };
  });

  await Order.insertMany(ordersToInsert);

  console.log("✅ Seed completed successfully with diverse orders, statuses, and payment states.");
  await mongoose.disconnect();
  console.log("🔌 Disconnected");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});