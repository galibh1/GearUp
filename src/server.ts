import app from './app';
import { prisma } from './lib/prisma';
import "dotenv/config";
import config from './config';

const PORT = config.PORT;

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected to the database successfully. ');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
     prisma.$disconnect();
    process.exit(1);
  }
}

main();