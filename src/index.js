import { env } from './utils/env.js';
import app from './app.js';
import connectToMongoDB from '../src/config/mongodb.config.js';
const PORT = env.PORT || 3000;

app.listen(PORT, async () => {
  await connectToMongoDB();
  console.log(`Server is  on http://localhost:${PORT}`);
});
