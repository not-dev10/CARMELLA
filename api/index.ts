export default (req, res) => {
  res.json({ 
    message: 'API routes handled by backend',
    apiUrl: 'https://carmellawholesale.uk',
    status: 'Backend running on EC2'
  });
};
