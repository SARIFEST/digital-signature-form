# שלב 1: התקנת צד השרת והלקוח
FROM node:18-slim

# יצירת תיקיית עבודה
WORKDIR /app

# העתקת כל הקבצים
COPY . .

# התקנת תלויות עבור השרת
RUN npm install

# התקנת תלויות ובניית צד לקוח (React)
RUN npm install --prefix client && npm run build --prefix client

# הגדרת משתנה סביבה (אם צריך)
ENV NODE_ENV=production

# פתיחת הפורט
EXPOSE 3000

# התחלת השרת
CMD ["npm", "start"]
