const { VertexAI } = require('@google-cloud/vertexai');
const project = 'usa-wrapped';
const location = 'us-central1';
const vertexAI = new VertexAI({ project, location });

async function testModel(modelName) {
  try {
    const model = vertexAI.getGenerativeModel({ model: modelName });
    const res = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'Hello' }] }] });
    console.log(`[SUCCESS] ${modelName} works!`);
  } catch (error) {
    console.log(`[FAILED] ${modelName}: ${error.message}`);
  }
}

async function runTests() {
  await testModel('gemini-1.5-flash-001');
  await testModel('gemini-1.5-pro-002');
  await testModel('gemini-2.5-pro');
  await testModel('gemini-1.5-flash');
}
runTests();
