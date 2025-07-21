FROM node:22 AS build


WORKDIR /frontend


COPY ./package*.json ./
COPY ./vite.config.js ./
COPY . .

RUN npm install
RUN npm run build



FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*


COPY --from=build /frontend/dist /usr/share/nginx/html

COPY default.conf /etc/nginx/conf.d/default.conf


EXPOSE  80


# Executar o nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]


