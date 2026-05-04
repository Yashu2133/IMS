## Seeing the System in Action

### Option 1: One curl command (fastest - no setup needed)
```bash
curl -X POST https://ims-backend-yx2q.onrender.com/api/signals \
  -H "Content-Type: application/json" \
  -d '{"componentId":"PAYMENT_API","type":"API_FAILURE","message":"Payment timeout"}'
```
Then open https://incmasys.netlify.app to see the incident.

### Option 2: Full simulator (generates multiple incidents)
```bash
git clone https://github.com/YOUR_USERNAME/ims-project
cd ims-project/backend
npm install
node simulator.js
```
Then open https://incmasys.netlify.app to see all incidents appear.