FROM node:18-slim

# התקנות הדרושות להמרת DOCX ל־PDF
RUN apt-get update && \
    apt-get install -y libreoffice libreoffice-writer libreoffice-common && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    [ -e /usr/bin/soffice ] || ln -s /usr/bin/libreoffice /usr/bin/soffice

# יצירת תיקייה ראשית לאפליקציה
WORKDIR /app

# העתקת כל הקבצים לפרויקט
COPY . .

# התקנת תלויות ל־Node.js
RUN npm install

# התקנת תלויות ו־Build ל־React (בתוך client)
RUN npm install --prefix client && npm run build --prefix client

# משתני סביבה
ENV NODE_ENV=production

# פתיחת פורט
EXPOSE 3000

# הפעלת האפליקציה
CMD ["npm", "start"]
