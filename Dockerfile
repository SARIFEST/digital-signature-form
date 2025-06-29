FROM node:18-slim

# התקנות הדרושות להמרת DOCX ל־PDF
RUN apt-get update && \
    apt-get install -y libreoffice libreoffice-writer libreoffice-common && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    ln -s /usr/bin/libreoffice /usr/bin/soffice

# יצירת תיקייה
WORKDIR /app

# העתקת כל הקבצים
COPY . .

# התקנת תלויות
RUN npm install
RUN npm install --prefix client && npm run build --prefix client

# משתני סביבה
ENV NODE_ENV=production

# פתיחת פורט
EXPOSE 3000

# התחלת האפליקציה
CMD ["npm", "start"]
