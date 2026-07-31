import bcrypt from "bcryptjs";

import config from "../src/config";
import { prisma } from "../src/lib/prisma";

const providerEmail = "provider@gearup.com";
const providerPassword = "Provider123!";

const customerEmail = "customer@gearup.com";
const customerPassword = "Customer123!";

const seedUsers = async () => {
  const adminHashedPassword = await bcrypt.hash(
    config.admin_password,
    Number(config.bcrypt_salt_rounds),
  );

  const providerHashedPassword = await bcrypt.hash(
    providerPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const customerHashedPassword = await bcrypt.hash(
    customerPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const admin = await prisma.user.upsert({
    where: {
      email: config.admin_email,
    },
    update: {
      name: config.admin_name,
      password: adminHashedPassword,
      role: "ADMIN",
      activeStatus: "ACTIVE",
    },
    create: {
      name: config.admin_name,
      email: config.admin_email,
      password: adminHashedPassword,
      role: "ADMIN",
      activeStatus: "ACTIVE",
    },
  });

  const provider = await prisma.user.upsert({
    where: {
      email: providerEmail,
    },
    update: {
      name: "GearUp Demo Provider",
      password: providerHashedPassword,
      role: "PROVIDER",
      activeStatus: "ACTIVE",
    },
    create: {
      name: "GearUp Demo Provider",
      email: providerEmail,
      password: providerHashedPassword,
      role: "PROVIDER",
      activeStatus: "ACTIVE",
    },
  });

  const customer = await prisma.user.upsert({
    where: {
      email: customerEmail,
    },
    update: {
      name: "GearUp Demo Customer",
      password: customerHashedPassword,
      role: "CUSTOMER",
      activeStatus: "ACTIVE",
    },
    create: {
      name: "GearUp Demo Customer",
      email: customerEmail,
      password: customerHashedPassword,
      role: "CUSTOMER",
      activeStatus: "ACTIVE",
    },
  });

  return {
    admin,
    provider,
    customer,
  };
};

const seedCategories = async () => {
  const categoryData = [
    {
      name: "Camping",
      slug: "camping",
      description:
        "Tents, sleeping equipment, cooking gear and camping accessories.",
      imageUrl:
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
    },
    {
      name: "Cycling",
      slug: "cycling",
      description:
        "Bicycles, helmets and essential cycling equipment.",
      imageUrl:
        "https://images.unsplash.com/photo-1541625602330-2277a4c46182",
    },
    {
      name: "Fitness",
      slug: "fitness",
      description:
        "Fitness, gym and home-workout equipment.",
      imageUrl:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
    },
    {
      name: "Water Sports",
      slug: "water-sports",
      description:
        "Kayaks, paddle boards and water-sports equipment.",
      imageUrl:
        "https://images.unsplash.com/photo-1530053969600-caed2596d242",
    },
    {
      name: "Hiking",
      slug: "hiking",
      description:
        "Hiking backpacks, trekking poles and outdoor accessories.",
      imageUrl:
        "https://images.unsplash.com/photo-1551632811-561732d1e306",
    },
  ];

  const categories = [];

  for (const category of categoryData) {
    const createdCategory = await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        isActive: true,
      },
      create: {
        ...category,
        isActive: true,
      },
    });

    categories.push(createdCategory);
  }

  return categories;
};

const seedGearItems = async (
  providerId: string,
  categories: Awaited<ReturnType<typeof seedCategories>>,
) => {
  const campingCategory = categories.find(
    (category) => category.slug === "camping",
  );

  const cyclingCategory = categories.find(
    (category) => category.slug === "cycling",
  );

  const fitnessCategory = categories.find(
    (category) => category.slug === "fitness",
  );

  const hikingCategory = categories.find(
    (category) => category.slug === "hiking",
  );

  if (
    !campingCategory ||
    !cyclingCategory ||
    !fitnessCategory ||
    !hikingCategory
  ) {
    throw new Error(
      "Required categories were not created successfully",
    );
  }

  const gearData = [
    {
      name: "Four Person Camping Tent",
      slug: "four-person-camping-tent",
      description:
        "A waterproof four-person tent suitable for family camping and weekend trips.",
      brand: "NaturePeak",
      pricePerDay: 25,
      depositAmount: 80,
      stock: 5,
      availableStock: 5,
      condition: "GOOD" as const,
      status: "AVAILABLE" as const,
      imageUrls: [
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
      ],
      specifications: {
        capacity: "4 persons",
        waterproof: true,
        weight: "4.8 kg",
        setupTime: "10 minutes",
      },
      location: "Dhaka",
      isFeatured: true,
      categoryId: campingCategory.id,
      providerId,
    },
    {
      name: "Mountain Bike",
      slug: "mountain-bike",
      description:
        "A durable mountain bike suitable for trails, parks and outdoor adventures.",
      brand: "TrailMaster",
      pricePerDay: 35,
      depositAmount: 150,
      stock: 4,
      availableStock: 4,
      condition: "LIKE_NEW" as const,
      status: "AVAILABLE" as const,
      imageUrls: [
        "https://images.unsplash.com/photo-1541625602330-2277a4c46182",
      ],
      specifications: {
        frameSize: "Medium",
        wheelSize: "27.5 inches",
        gears: 21,
        helmetIncluded: true,
      },
      location: "Dhaka",
      isFeatured: true,
      categoryId: cyclingCategory.id,
      providerId,
    },
    {
      name: "Adjustable Dumbbell Set",
      slug: "adjustable-dumbbell-set",
      description:
        "An adjustable dumbbell set for strength training and home workouts.",
      brand: "PowerFlex",
      pricePerDay: 15,
      depositAmount: 50,
      stock: 8,
      availableStock: 8,
      condition: "GOOD" as const,
      status: "AVAILABLE" as const,
      imageUrls: [
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e",
      ],
      specifications: {
        maximumWeight: "24 kg",
        adjustable: true,
        pieces: 2,
      },
      location: "Dhaka",
      isFeatured: false,
      categoryId: fitnessCategory.id,
      providerId,
    },
    {
      name: "Hiking Backpack 50L",
      slug: "hiking-backpack-50l",
      description:
        "A spacious 50-litre hiking backpack with rain protection and padded straps.",
      brand: "AdventurePro",
      pricePerDay: 12,
      depositAmount: 40,
      stock: 6,
      availableStock: 6,
      condition: "NEW" as const,
      status: "AVAILABLE" as const,
      imageUrls: [
        "https://images.unsplash.com/photo-1551632811-561732d1e306",
      ],
      specifications: {
        capacity: "50 litres",
        rainCover: true,
        hydrationCompatible: true,
      },
      location: "Dhaka",
      isFeatured: false,
      categoryId: hikingCategory.id,
      providerId,
    },
  ];

  for (const gearItem of gearData) {
    await prisma.gearItem.upsert({
      where: {
        slug: gearItem.slug,
      },
      update: gearItem,
      create: gearItem,
    });
  }
};

const main = async () => {
  console.log("Starting GearUp database seed...");

  const users = await seedUsers();

  console.log("Users seeded successfully.");

  const categories = await seedCategories();

  console.log("Categories seeded successfully.");

  await seedGearItems(
    users.provider.id,
    categories,
  );

  console.log("Gear items seeded successfully.");

  console.log("");
  console.log("Seed completed successfully.");
  console.log("");
  console.log("Admin credentials:");
  console.log(`Email: ${config.admin_email}`);
  console.log(`Password: ${config.admin_password}`);
  console.log("");
  console.log("Provider credentials:");
  console.log(`Email: ${providerEmail}`);
  console.log(`Password: ${providerPassword}`);
  console.log("");
  console.log("Customer credentials:");
  console.log(`Email: ${customerEmail}`);
  console.log(`Password: ${customerPassword}`);
};

main()
  .catch((error: unknown) => {
    console.error("Database seeding failed:");

    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });