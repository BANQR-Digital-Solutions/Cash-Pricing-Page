# Pricing Calculator

A configurable static HTML pricing calculator that allows you to display different pricing plans with feature comparisons and dynamic price calculations.

## Features

- **Configurable pricing plans** - All plans, features, and pricing are defined in `config.json`
- **Dynamic price calculation** - Supports different pricing models:
  - Base plan with included users + additional user costs
  - Per-user pricing
  - Flat rate pricing
- **Monthly/Yearly billing toggle** - Switch between monthly and yearly pricing
- **Interactive user count input** - Calculate total costs based on number of users
- **Feature comparison table** - Compare features across different plans
- **Responsive design** - Works on desktop and mobile devices
- **Smooth animations** - Cards animate in on scroll

## Configuration

Edit `config.json` to customize your pricing:

### Plan Types

1. **Base with Additional Users** (`base_with_additional`)
   - Fixed base price for included users
   - Additional cost per extra user
   - Example: $29/month for 3 users, +$5/user for additional

2. **Per User** (`per_user`)
   - Fixed price per user
   - Example: $15/user/month

3. **Flat Rate** (`flat_rate`)
   - Fixed price regardless of user count
   - Example: $299/month unlimited users

### Configuration Structure

```json
{
  "meta": {
    "title": "Your Page Title",
    "subtitle": "Your subtitle",
    "currency": "$"
  },
  "plans": [
    {
      "id": "plan_id",
      "name": "Plan Name",
      "description": "Plan description",
      "popular": true/false,
      "pricing": {
        "monthly": 29,
        "yearly": 290,
        "type": "base_with_additional|per_user|flat_rate",
        "includedUsers": 3,
        "additionalUserCostMonthly": 5,
        "additionalUserCostYearly": 50
      },
      "features": [
        { "name": "Feature name", "included": true/false }
      ],
      "buttonText": "Get Started",
      "buttonAction": "signup|contact"
    }
  ]
}
```

## Usage

1. **Edit Configuration**: Modify `config.json` to match your pricing plans
2. **Customize Styling**: Edit `styles.css` to match your brand
3. **Deploy**: Upload files to your web server or host statically

## File Structure

- `index.html` - Main HTML structure
- `styles.css` - CSS styling
- `script.js` - JavaScript functionality
- `config.json` - Pricing configuration

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- No server-side requirements (pure static HTML/CSS/JS)

## License

MIT License - feel free to use and modify for your projects.
