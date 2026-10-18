ALVINA — সম্পূর্ণ সাইট (Vercel-এর জন্য)

ফাইলগুলো:
  index.html, style.css, script.js, config.js  -> সাইটের মূল ফাইল
  logo.jpg, hero.jpg                           -> লোগো ও হিরোর ছবি
  api/order.js                                 -> Telegram-এ অর্ডার পাঠানোর ফাংশন (টোকেন এতে নেই)

GitHub-এ আপলোড:
  1. এই zip খুলুন (Extract)।
  2. GitHub repository -> Add file -> Upload files -> index.html, style.css, script.js, config.js, logo.jpg, hero.jpg দিন -> Commit changes।
  3. api/order.js আগে GitHub-এ দেওয়া থাকলে আবার দিতে হবে না। না থাকলে: Add file -> Create new file -> নামের ঘরে  api/order.js  লিখে ফাইলের লেখা পেস্ট করে Commit করুন।

Vercel:
  Settings -> Environment Variables -> TELEGRAM_BOT_TOKEN (নতুন টোকেন) ও TELEGRAM_CHAT_ID (8738715995) দিন -> Deployments -> Redeploy।

হিরো ছবি বদলাতে:  সাইটের লিংকের শেষে ?admin=1 দিয়ে খুললে ছবি বাছাই করে প্রিভিউ দেখা যাবে।
স্থায়ী করতে ছবিটা hero.jpg নামে আপলোড করুন।
টেস্ট অর্ডার দেখতে লিংকের শেষে ?debug=1 দিন।
দাম, লেখা, নাম্বার, ব্যাংকের তথ্য বদলাতে config.js খুলুন।
