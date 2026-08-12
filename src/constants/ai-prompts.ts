import { PromptCard } from "@/types/interface/ai.interface";

export const AI_PROMPTS: PromptCard[] = [
  {
    id: 1,
    icon: "📦",
    title: "Track My Order",
    description: "Check the status and delivery progress of an order.",
    prompt:
      "I want to track an order. My order ID is a string starting with a few characters and digits — I'll paste it here. Can you check its status for me?",
  },
  {
    id: 2,
    icon: "🔍",
    title: "Find a Product",
    description: "Search the catalog for a specific product.",
    prompt:
      "Find me a great wireless headphone under ₹5,000 with good sound quality.",
  },
  {
    id: 3,
    icon: "🚚",
    title: "Shipping Policy",
    description: "Learn about delivery times and shipping costs.",
    prompt:
      "What are your shipping costs and how long does standard delivery take?",
  },
  {
    id: 4,
    icon: "🔄",
    title: "Return Policy",
    description: "Understand the return and refund process.",
    prompt:
      "How does the return policy work? What is the return window and are there any conditions?",
  },
  {
    id: 5,
    icon: "🛡️",
    title: "Warranty & Support",
    description: "Know the warranty coverage on products.",
    prompt:
      "What warranty coverage do you offer on electronics and accessories?",
  },
  {
    id: 6,
    icon: "💳",
    title: "Payment Methods",
    description: "See what payment options are accepted.",
    prompt:
      "Which payment methods do you accept at checkout?",
  },
  {
    id: 7,
    icon: "📱",
    title: "Smartphone Deals",
    description: "Discover the latest smartphone deals.",
    prompt:
      "Show me the best smartphones on sale right now with good battery life.",
  },
  {
    id: 8,
    icon: "🏠",
    title: "Home Appliances",
    description: "Explore appliances for your home.",
    prompt:
      "Recommend a reliable refrigerator under ₹30,000 for a family of four.",
  },
  {
    id: 9,
    icon: "👗",
    title: "Fashion Finds",
    description: "Get fashion product suggestions.",
    prompt:
      "Suggest some stylish casual wear options for women under ₹2,000.",
  },
  {
    id: 10,
    icon: "🎁",
    title: "Gift Ideas",
    description: "Find the perfect gift for someone special.",
    prompt:
      "Suggest good gift ideas under ₹3,000 for a friend's birthday.",
  },
  {
    id: 11,
    icon: "🤝",
    title: "Talk to Support",
    description: "Create a support ticket for human assistance.",
    prompt:
      "I need help from a human agent. Please create a support ticket for me.",
  },
  {
    id: 12,
    icon: "🤖",
    title: "Ask Anything",
    description: "Ask any shopping or store related question.",
    prompt:
      "Help me with any shopping question I have about Clicon.",
  },
];