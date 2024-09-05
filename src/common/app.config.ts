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
    PrivacyPolicy: '',
  },
} as const;