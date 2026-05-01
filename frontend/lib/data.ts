export type Food = {
  id: number;
  name: string;
  category: string;
  price: number;
  emoji: string;
  restaurant: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  description: string;
  ingredients: string[];
  location: string;
};

export const CATEGORIES = ["Pizza", "Burger", "Steak", "Seafood", "Crispy", "Pasta", "Salad", "Breakfast"];

export const RESTAURANTS = ["Giovanni Restaurant", "Senzo Restaurant", "Naporitan", "Giovani", "Shandy"];

export const LOCATIONS = ["Esfahan", "Shiraz", "Tehran", "Tabriz"];

export const FOODS: Food[] = [
  {
    id: 1, name: "Special Pizza", category: "Pizza", price: 120, emoji: "🍕",
    restaurant: "Giovanni Restaurant", rating: 4.5, reviews: 122, deliveryTime: "20-30",
    description: "Our Special Pizza is crafted with the finest ingredients, topped with mozzarella, fresh tomatoes, and our signature sauce. Baked to golden perfection in a wood-fired oven.",
    ingredients: ["Mozzarella", "Tomato", "Basil", "Olive Oil"],
    location: "Tehran, Marzdan",
  },
  {
    id: 2, name: "Vegetarian Pizza", category: "Pizza", price: 95, emoji: "🍕",
    restaurant: "Senzo Restaurant", rating: 4.3, reviews: 89, deliveryTime: "25-35",
    description: "A colorful blend of fresh garden vegetables on our signature tomato base.",
    ingredients: ["Bell Peppers", "Mushroom", "Zucchini", "Olives"],
    location: "Esfahan",
  },
  {
    id: 3, name: "Pepperoni Pizza", category: "Pizza", price: 135, emoji: "🍕",
    restaurant: "Naporitan", rating: 4.7, reviews: 200, deliveryTime: "20-30",
    description: "Loaded with premium pepperoni slices and extra cheese.",
    ingredients: ["Pepperoni", "Mozzarella", "Tomato Sauce", "Oregano"],
    location: "Tehran",
  },
  {
    id: 4, name: "Margarita Pizza", category: "Pizza", price: 110, emoji: "🍕",
    restaurant: "Giovani", rating: 4.4, reviews: 145, deliveryTime: "15-25",
    description: "The classic Margherita — simple, elegant, and delicious.",
    ingredients: ["Fresh Tomato", "Mozzarella", "Basil", "Garlic"],
    location: "Shiraz",
  },
  {
    id: 5, name: "Penne Pasta", category: "Pasta", price: 85, emoji: "🍝",
    restaurant: "Senzo Restaurant", rating: 4.2, reviews: 67, deliveryTime: "15-20",
    description: "Penne in a rich tomato and herb sauce with a hint of garlic.",
    ingredients: ["Penne", "Tomato", "Garlic", "Parmesan"],
    location: "Tehran",
  },
  {
    id: 6, name: "Spaghetti", category: "Pasta", price: 120, emoji: "🍝",
    restaurant: "Giovanni Restaurant", rating: 4.5, reviews: 122, deliveryTime: "20-30",
    description: "Classic spaghetti with a hearty bolognese sauce and fresh parmesan.",
    ingredients: ["Spaghetti", "Ground Beef", "Tomato", "Parmesan"],
    location: "Tehran, Marzdan",
  },
  {
    id: 7, name: "Chicken Pasta", category: "Pasta", price: 95, emoji: "🍝",
    restaurant: "Naporitan", rating: 4.6, reviews: 98, deliveryTime: "20-25",
    description: "Tender grilled chicken strips tossed with pasta in a creamy sauce.",
    ingredients: ["Chicken", "Pasta", "Cream", "Garlic"],
    location: "Tehran",
  },
  {
    id: 8, name: "Shaped Pasta", category: "Pasta", price: 78, emoji: "🍝",
    restaurant: "Giovani", rating: 4.1, reviews: 45, deliveryTime: "15-20",
    description: "Fun shaped pasta in a classic marinara sauce.",
    ingredients: ["Shaped Pasta", "Marinara", "Basil", "Olive Oil"],
    location: "Shiraz",
  },
  {
    id: 9, name: "Grilled Chicken", category: "Steak", price: 145, emoji: "🍗",
    restaurant: "Senzo Restaurant", rating: 4.8, reviews: 234, deliveryTime: "30-40",
    description: "Juicy grilled chicken seasoned with Mediterranean herbs and spices.",
    ingredients: ["Chicken", "Rosemary", "Thyme", "Lemon"],
    location: "Tehran",
  },
  {
    id: 10, name: "Beef Steak", category: "Steak", price: 165, emoji: "🥩",
    restaurant: "Giovanni Restaurant", rating: 4.6, reviews: 178, deliveryTime: "35-45",
    description: "Premium cut beef steak cooked to your preference.",
    ingredients: ["Beef", "Garlic Butter", "Rosemary", "Sea Salt"],
    location: "Tehran, Marzdan",
  },
  {
    id: 11, name: "Crispy Chicken", category: "Crispy", price: 75, emoji: "🍗",
    restaurant: "Naporitan", rating: 4.3, reviews: 156, deliveryTime: "15-20",
    description: "Perfectly crispy chicken with our secret batter recipe.",
    ingredients: ["Chicken", "Breadcrumbs", "Spices", "Buttermilk"],
    location: "Tehran",
  },
  {
    id: 12, name: "Fish & Chips", category: "Seafood", price: 88, emoji: "🐟",
    restaurant: "Senzo Restaurant", rating: 4.2, reviews: 89, deliveryTime: "20-25",
    description: "Classic fish and chips with tartar sauce.",
    ingredients: ["White Fish", "Potato", "Batter", "Tartar Sauce"],
    location: "Esfahan",
  },
];
