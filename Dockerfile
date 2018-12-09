FROM node

# Create app directory
WORKDIR /usr/src/app

# Copy package.json
COPY package*.json ./

# install deps
RUN npm install

# Bundle app source
COPY . .

# build
RUN npm run build

CMD [ "npm", "start" ]
