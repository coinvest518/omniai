


// promptsData.ts
export interface Prompt {
  userId?: string;
  isPurchased?: boolean;
  id?: string; // Change to ObjectId
  promptTitle: string;
  description: string;
  promptData: string;
  imgSrc: string;
  creditPrice: number;
  category: string;
  showCopyButton?: boolean;
}

export const prompts = [
  {
    id: 'Omni.Ai NFT1',
    promptTitle: "Business Assistant",
    description: "An intelligent assistant to help you with tasks.",
    promptData: "Hypothesis: Our target market is primarily interested in [product/service] due to [reason].Evidence: Can you find data on the market size, demographics, and trends for [target market]? Counterarguments: Are there any competing products or services that could pose a threat? Conclusions: Based on the evidence, is our hypothesis about the target market accurate?",
    imgSrc: '/images/ai-bot-1.jpg',
    creditPrice: 10,
    category: 'business',
  },
  {
    id: 'Omni.Ai NFT2',
    promptTitle: "Developer Coder",
    description: "Analyze your data with advanced algorithms.",
    promptData: "Hypothesis: Refactoring the [code section] will improve performance by [percentage]. Evidence: Can you measure the current performance of the code and identify potential bottlenecks? Counterarguments: Are there any risks or drawbacks associated with refactoring the code? Conclusions: Is our hypothesis about code optimization justified based on the data?",
    imgSrc: '/images/ai-bot-2.png',
    creditPrice: 10,
    category: 'developer',

  },
  {
    id: 'Omni.Ai NFT3',
    promptTitle: "Creative Social Media Designer",
    description: "Design stunning visuals with ease.",
    promptData: "Hypothesis: Creating [type of content] will increase engagement on our social media channels.Evidence: Can you analyze our existing content performance and identify trends or patterns? Counterarguments: Are there any potential risks or drawbacks associated with [type of content]? Conclusions: Is our hypothesis about content strategy supported by the data?",
    imgSrc: '/images/ai-bot-3.png',
    creditPrice: 10,
    category: 'social',

  },
  {
    id: 'Omni.Ai NFT4',
    promptTitle: "Content Writer",
    description: "Generate high-quality content effortlessly.",
    promptData: "Creating [specific type of content], such as [example], will [increase/improve] [specific metric], like [engagement, reach, conversions], on our social media channels.",
    imgSrc: '/images/ai-bot-7.png',
    creditPrice: 10,
    category: 'social',

  },
  {
    id: 'Omni.Ai NFT5',
    promptTitle: "YouTube Assistant",
    description: "An intelligent assistant to help you with your YouTube tasks.",
    promptData: "Channel Concept: You are a thought-provoking ai and this channel explores various topics and or task. You and I will you hypothesis testing. Each episode will delve into a specific question or claim, presenting evidence, considering counterarguments, and drawing informed conclusions. This is an YouTube Structure Introduction Clearly state the hypothesis or question to be explored. Evidence Gathering: Research and present relevant data, studies, or expert opinions. Counterarguments Discuss potential alternative viewpoints or objections to the hypothesis. Analysis and Conclusions Analyze the evidence and counterarguments to draw informed conclusions about the hypothesis. Call to Action Encourage viewers to share their thoughts, ask questions, or suggest future topics.",
    imgSrc: '/images/ai-bot-4.png',
    creditPrice: 10,
    category: 'youtube',
  },
  {
    id: 'Omni.Ai NFT6',
    promptTitle: "Artist Maker",
    description: "An intelligent assistant to help you with Art & Draw tasks.",
    promptData: "Create an abstract AI painting in the style of Wassily Kandinsky, incorporating elements of cyberpunk aesthetics and neon colors. The artwork should evoke a sense of futuristic energy and explore the themes of technology, society, and human connection.",
    imgSrc: '/images/ai-bot-6.png',
    creditPrice: 10,
    category: 'art',
  },
  {
    id: 'Omni.Ai NFT7',
    promptTitle: "Realistic Art",
    description: "Make Your Art Look more Real",
    promptData: "an image of a dark skin queen Tiye of Egypt. Make her beautiful and fierce, in background show her empire.Photography, Ultra - Wide Angle, Depth of Field, hyper - detailed, beautifully color - coded, insane details, intricate details, beautifully color graded, Unreal Engine, Cinematic, Color Grading, Editorial Photography, Photography, Photoshoot, Shot on 70mm lens, Depth of Field, DOF, Tilt Blur, Shutter Speed 1/ 1000, F/ 2, White Balance, 32k, Super - Resolution, Megapixel, Pro Photo GB, VR, Lonely, Good, Massive, Half rear Lighting, Backlight, Natural Lighting, Incandescent, Optical Fiber, Moody Lighting, Cinematic Lighting, Studio Lighting, Soft Lighting, Volumetric, Contre - Jour, Beautiful Lighting, Accent Lighting, Global Illumination, Screen Space Global Illumination, Ray Tracing Global Illumination, Optics, Scattering, Glowing, Shadows, Rough, Shimmering, Ray Tracing Reflections, Lumen Reflections, Screen Space Reflections, Diffraction Grading, Chromatic Aberration, GB Displacement, Scan Lines, R a y Traced, Ray Tracing Ambient Occlusion, Anti - Aliasing, FKAA, TXAA, RTX, SSAO, Shaders, OpenGL - Shaders, GLSL - Shaders, Post Processing, Post - Production, Cell Shading, Tone Mapping, CGI, VFX, SFX, insanely detailed and intricate, hyper maximalist, elegant, hyper realistic, super detailed, dynamic pose, photography, Hyper realistic, volumetric, photorealistic, ultra photoreal, ultra - detailed, super detailed, full color, ambient occlusion, volumetric lighting, high contrast, HDR super detailed various camera views, 8k --ar 3:2 --stylize 750 --v 5",
    imgSrc: '/images/Queen.png',
    creditPrice: 500,
    category: 'art',
  },
];