# AdSense Integration for WordPress Blog Posts

## Overview

Your blog now has proper Google AdSense integration that automatically detects and renders ads within your WordPress blog posts. The system uses `html-react-parser` to safely parse WordPress HTML content and replace AdSense ad tags with React components.

## How It Works

### 1. AdSense Script Loading

- The AdSense script is loaded once in `client/index.html` in the `<head>` section
- Uses your publisher ID: `ca-pub-4560705956205775`

### 2. Content Parsing

- Blog post content from WordPress API is parsed using `html-react-parser`
- Any `<ins class="adsbygoogle">` tags are automatically converted to React `AdComponent`s
- All `<script>` tags are removed for security

### 3. Ad Rendering

- Each ad is rendered as a React component with proper initialization
- Ads automatically call `(window.adsbygoogle = window.adsbygoogle || []).push({})` to initialize
- Test ads are shown in development mode (`data-adtest="on"`)

## File Structure

```
client/src/components/
├── AdComponent.tsx           # Individual ad component
├── BlogContentWithAds.tsx    # Content parser with ad replacement
└── TestAdComponent.tsx       # Testing component (optional)

client/src/pages/
└── BlogPost.tsx             # Updated to use ad-aware content parsing

client/index.html            # AdSense script loaded here
client/src/index.css         # Ad styling
```

## Setup Instructions

### 1. Create Ad Units in AdSense

1. Go to your [Google AdSense dashboard](https://adsense.google.com/)
2. Navigate to **Ads** → **By ad unit**
3. Create new ad units for your blog posts
4. Copy the `data-ad-slot` values (they look like: `1234567890`)

### 2. Add Ads to WordPress Posts

In your WordPress admin, when editing posts, add AdSense ad code like this:

```html
<!-- Example ad placement in WordPress post content -->
<ins
  class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-4560705956205775"
  data-ad-slot="YOUR_AD_SLOT_ID_HERE"
  data-ad-format="auto"
  data-full-width-responsive="true"
></ins>
```

**Important:** Replace `YOUR_AD_SLOT_ID_HERE` with your actual ad slot ID from AdSense.

### 3. Authorize Your Domain

1. In your AdSense dashboard, go to **Sites**
2. Add `potential.com` and `www.potential.com` to your authorized sites
3. Wait for approval (this can take a few hours to days)

## Ad Formats Supported

### Auto Ads (Recommended)

```html
<ins
  class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-4560705956205775"
  data-ad-slot="1234567890"
  data-ad-format="auto"
  data-full-width-responsive="true"
></ins>
```

### Fixed Size Ads

```html
<ins
  class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-4560705956205775"
  data-ad-slot="1234567890"
  data-ad-format="rectangle"
  data-full-width-responsive="false"
></ins>
```

### Banner Ads

```html
<ins
  class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-4560705956205775"
  data-ad-slot="1234567890"
  data-ad-format="banner"
  data-full-width-responsive="true"
></ins>
```

## Testing

### Development Mode

- Ads will show with `data-adtest="on"` for testing
- You'll see placeholder/test ads instead of real ones
- Check browser console for any AdSense errors

### Production Testing

1. Deploy to production
2. Check that ads load properly
3. Verify in AdSense dashboard that ad requests are being recorded
4. Monitor performance in AdSense reporting

## Troubleshooting

### Ads Not Showing

1. **Check browser console** for JavaScript errors
2. **Verify domain authorization** in AdSense dashboard
3. **Check ad slot IDs** are correct in WordPress content
4. **Ensure sufficient content** - AdSense requires substantial content around ads
5. **Wait for approval** - new sites can take time to be approved

### Common Issues

#### 1. Ad Blocked by Browser

- Test with ad blocker disabled
- Some browsers block ads by default

#### 2. Policy Violations

- Ensure content complies with AdSense policies
- Check for any policy violation notices in AdSense dashboard

#### 3. Limited Ad Serving

- New sites often have limited ad serving initially
- Performance improves over time with more traffic

## Development Tools

### Test Component

Use the `TestAdComponent` to test ad placement:

```tsx
import TestAdComponent from "@/components/TestAdComponent";

// Add this to any page during development to test ads
<TestAdComponent />;
```

### Manual Ad Component Usage

You can also manually place ads in React components:

```tsx
import AdComponent from "@/components/AdComponent";

<AdComponent
  slot="1234567890"
  format="auto"
  responsive={true}
  className="my-8"
/>;
```

## Best Practices

### 1. Ad Placement

- Place ads after the first paragraph or two of content
- Don't place too many ads in short posts
- Ensure ads don't interfere with user experience

### 2. Performance

- Ads are lazy-loaded and won't block page rendering
- Monitor Core Web Vitals impact in Google PageSpeed Insights

### 3. Content Guidelines

- Maintain high-quality, original content
- Ensure sufficient text content around ads
- Follow AdSense content policies

## Monitoring

### AdSense Dashboard

- Check daily/weekly earnings
- Monitor ad performance metrics
- Review policy compliance

### Analytics Integration

- Link AdSense with Google Analytics for detailed insights
- Track ad click-through rates
- Monitor user engagement impact

## Next Steps

1. **Create ad units** in your AdSense dashboard
2. **Add ad codes** to your WordPress blog posts
3. **Test on staging** environment first
4. **Deploy to production** and monitor performance
5. **Optimize placement** based on performance data

Remember: AdSense approval and optimal ad serving can take time. Be patient and focus on creating quality content while monitoring performance through the AdSense dashboard.
