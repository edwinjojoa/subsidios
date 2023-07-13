FROM node:16
# Create app directory
WORKDIR /app5
# Copy the files into workdir
COPY package*.json ./
# Install all the dependencies
RUN npm install
# Bundle app source
COPY . .
# Run the node command
CMD ["node","src/index.js"]
#docker build -t nodemicro .   construir
#docker run -it -p 3100:3100 nodemicro    correr

