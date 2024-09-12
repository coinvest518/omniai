/**
 * Application Identity (Brand)
 *
 * Also note that the 'Brand' is used in the following places:
 *  - README.md               all over
 *  - package.json            app-slug and version
 *  - [public/manifest.json]  name, short_name, description, theme_color, background_color
 */
export const Brand = {
  Title: {
    Base: 'omni-AI',
    Common: (process.env.NODE_ENV === 'development' ? '[DEV] ' : '') + 'omni-AI',
  },
  Meta: {
    Description: 'Launch Omni-AI to unlock the full potential of AI, with precise control over your data and models. Voice interface, AI personas, advanced features, and fun UX.',
    SiteName: 'Omni-AI | Precision AI for You',
    ThemeColor: '#32383E',
    TwitterSite: '@omniai.ai',
  },
  URIs: {
    Home: 'https://coinvestinc.xyz',
    // App: '',
    CardImage: '',
    OpenRepo: 'https://github.com/coinvest518',
    OpenProject: 'https://github.com/coinvest518',
    SupportInvite: 'https://discord.gg/NTNszcwE',
    // Twitter: 'https://www.twitter.com/omni_ai',
    ProductHunt: 'https://www.producthunt.com/posts/omni-ai-multi-ai-chat-interface?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-omni&#0045;ai&#0045;multi&#0045;ai&#0045;chat&#0045;interface',
    PrivacyPolicy: "https://coinvestinc.xyz/privacy-policy",
  },
} as const;

