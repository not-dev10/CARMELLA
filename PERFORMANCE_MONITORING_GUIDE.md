# API Performance Monitoring Guide

## Overview
The Carmella application now includes comprehensive latency tracking for all API endpoints. Monitor real-time performance metrics from the admin dashboard.

## How to Access Performance Monitor

1. **Navigate to Admin Panel**
   - Go to `http://localhost:5173/admin`
   - Login with admin credentials

2. **Click "Performance Monitor"**
   - Located in the left sidebar
   - Icon: Activity (chart icon)

3. **Start Monitoring**
   - Click "Start Monitoring" button
   - The system will begin capturing API latency data

## What Gets Tracked

### Frontend Latency (Browser Console)
- **Format**: `[API] Success response: {..., latency: "XXms"}`
- Tracks time from request initiation to response received
- Includes all API calls from the frontend

### Backend Latency (Server Logs)
- **Format**: `[LATENCY] METHOD PATH - Status: XXX - XXms`
- Tracks total HTTP request/response time
- Includes all endpoints

### Detailed Metrics
- **[PRODUCTS]**: Product query times
- **[INVENTORY]**: Inventory fetch and product enrichment times
- **[CART]**: Cart operations timing
- **[ORDER]**: Order creation and processing times
- **[ADMIN]**: Admin operations timing

## Performance Dashboard Metrics

### Summary Stats
- **Avg Latency**: Average response time across all requests
- **Max Latency**: Slowest response time recorded
- **Min Latency**: Fastest response time recorded
- **Total Requests**: Number of API calls tracked

### Endpoint Statistics
For each endpoint, you'll see:
- **Method**: HTTP method (GET, POST, PUT, DELETE)
- **Endpoint**: API path
- **Avg**: Average latency for this endpoint
- **Min**: Minimum latency
- **Max**: Maximum latency
- **Count**: Number of times called
- **Last**: Most recent latency

### Color Coding
- **Green** (< 100ms): Excellent performance
- **Yellow** (100-300ms): Good performance
- **Orange** (300-500ms): Acceptable performance
- **Red** (> 500ms): Needs optimization

## Interpreting Results

### Good Performance Indicators
- Most endpoints under 200ms
- Consistent latency (low variance between min/max)
- No 500+ ms responses

### Performance Issues to Watch
- Endpoints consistently over 500ms
- High variance (large gap between min/max)
- Increasing latency over time
- Specific endpoints slower than others

## Common Slow Endpoints & Solutions

### Slow: GET /api/products (> 300ms)
**Cause**: Large dataset or complex filtering
**Solution**: 
- Implement pagination
- Add database indexes
- Cache frequently accessed data

### Slow: GET /api/admin/inventory (> 400ms)
**Cause**: Multiple database queries (inventory + products)
**Solution**:
- Use database joins instead of separate queries
- Implement query optimization
- Add caching layer

### Slow: POST /api/orders (> 500ms)
**Cause**: Multiple validations and database operations
**Solution**:
- Optimize database transactions
- Reduce number of queries
- Implement batch operations

## Monitoring Best Practices

1. **Regular Checks**
   - Monitor performance daily
   - Track trends over time
   - Identify degradation early

2. **Load Testing**
   - Test with realistic traffic
   - Monitor during peak hours
   - Identify bottlenecks under load

3. **Optimization Cycle**
   - Identify slow endpoints
   - Implement optimizations
   - Measure improvement
   - Document changes

4. **Alert Thresholds**
   - Set alerts for endpoints > 500ms
   - Monitor error rates
   - Track database query times

## Console Log Examples

### Frontend Logs
```
[API] Request: {method: "GET", endpoint: "/products", hasToken: true}
[API] Response status: 200 for /products (145ms)
[API] Success response: {endpoint: '/products', dataKeys: [...], latency: "145ms"}
```

### Backend Logs
```
[LATENCY] GET /api/products - Status: 200 - 234ms
[PRODUCTS] getProducts completed - Query: 120ms, Total: 145ms, Items: 15
[INVENTORY] getInventory query completed - 89ms. Found items: 15, Returned: 15
```

## Exporting Performance Data

To export performance metrics:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Copy logs with latency data
4. Paste into text editor or spreadsheet
5. Analyze trends

## Performance Targets

### Recommended Latency Targets
- **GET endpoints**: < 200ms
- **POST endpoints**: < 300ms
- **PUT endpoints**: < 250ms
- **DELETE endpoints**: < 200ms
- **Admin endpoints**: < 400ms

### Database Query Targets
- **Simple queries**: < 50ms
- **Complex queries**: < 100ms
- **Batch operations**: < 200ms

## Troubleshooting

### Monitor Not Showing Data
1. Ensure monitoring is started
2. Make API calls to generate data
3. Check browser console for errors
4. Verify backend is running

### Inconsistent Latency
- Network conditions vary
- Server load fluctuates
- Database performance varies
- Check for background processes

### High Latency Spikes
- Check server CPU/memory usage
- Monitor database connections
- Look for slow queries
- Check network conditions

## Next Steps

1. **Baseline**: Record current performance metrics
2. **Monitor**: Track performance over time
3. **Optimize**: Identify and fix slow endpoints
4. **Verify**: Confirm improvements
5. **Maintain**: Continue monitoring for regressions
