# בוחר בסיס Node.js (אפשר להתאים גרסה)
FROM node:18-slim

# התקנת LibreOffice
RUN apt-get update && apt-get install -y libreoffice libreoffice-writer libreoffice-common && apt-get clean && rm -rf /var/lib/apt/lists/*

# הגדרת תיקיית עבודה
WORKDIR /app

# העתקת קבצי התלויות והתקנתם
COPY package*.json ./
RUN npm install

# העתקת כל קוד המקור
COPY . .

# חשיפת הפורט שהשרת מקשיב לו
EXPOSE 3000

# הפקודה להרצת השרת
CMD ["node", "server.js"]
