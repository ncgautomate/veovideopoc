// Ready-made prompt templates for video generation
export const promptTemplates = {
  cinematic: {
    name: 'Cinematic Styles',
    icon: '🎬',
    color: 'from-purple-500 to-pink-500',
    templates: [
      {
        id: 'film-noir',
        name: 'Film Noir',
        icon: '🎭',
        prompt: 'Dramatic black and white scene, high contrast lighting with deep shadows casting across venetian blinds, mysterious detective silhouette in fedora and trench coat, cigarette smoke swirling in shaft of light, 1940s noir aesthetic, rain-slicked city street visible through window, moody atmospheric jazz music with saxophone, film grain texture',
        tags: ['black-white', 'dramatic', 'vintage', 'mystery'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'action-scene',
        name: 'Action Chase',
        icon: '🏃',
        prompt: 'High-energy chase scene through urban environment, fast camera tracking with dynamic motion blur, explosive colors and dramatic lighting, debris flying, sparks and smoke effects, intense orchestral music with heavy percussion, adrenaline-pumping cinematography, handheld camera style',
        tags: ['action', 'fast-paced', 'urban', 'intense'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'sci-fi-future',
        name: 'Sci-Fi Future',
        icon: '🚀',
        prompt: 'Futuristic cityscape at night, towering skyscrapers with holographic advertisements, neon lights in cyan and magenta reflecting on wet streets, flying vehicles with glowing trails, rain falling, cyberpunk aesthetic, electronic ambient soundtrack with synthesizers, slow camera pan revealing sprawling metropolis',
        tags: ['sci-fi', 'futuristic', 'neon', 'cyberpunk'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'documentary',
        name: 'Documentary',
        icon: '📹',
        prompt: 'Authentic documentary style footage, natural handheld camera movement with slight shake, observational perspective, soft natural lighting, environmental ambient sounds, candid cinematography, realistic color grading, intimate framing',
        tags: ['documentary', 'realistic', 'natural', 'authentic'],
        settings: { resolution: '720p', duration: 8, aspectRatio: '16:9' }
      }
    ]
  },

  product: {
    name: 'Product Showcase',
    icon: '🛍️',
    color: 'from-blue-500 to-cyan-500',
    templates: [
      {
        id: 'luxury-product',
        name: 'Luxury Item',
        icon: '💎',
        prompt: 'Elegant luxury product rotating slowly on reflective glossy black surface, professional studio lighting with soft shadows, smooth 360-degree camera orbit, upscale minimalist background with subtle gradient, sophisticated ambient music with piano, premium aesthetic, shallow depth of field',
        tags: ['luxury', 'elegant', 'studio', 'premium'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'tech-reveal',
        name: 'Tech Gadget',
        icon: '📱',
        prompt: 'Modern tech product dramatic reveal, clean pure white background, studio lighting transitioning from dark to bright, close-up macro details of sleek design, smooth robotic camera movements, futuristic sound design with electronic elements, minimalist aesthetic, reflective surfaces',
        tags: ['tech', 'modern', 'clean', 'minimal'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'food-shot',
        name: 'Food & Drink',
        icon: '🍽️',
        prompt: 'Appetizing food close-up, steam rising beautifully, golden hour warm lighting casting soft glow, shallow depth of field with creamy bokeh, rustic wooden table surface, fresh ingredients visible, ambient cafe sounds with gentle chatter, mouth-watering presentation, natural colors enhanced',
        tags: ['food', 'appetizing', 'warm', 'cozy'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      }
    ]
  },

  nature: {
    name: 'Nature & Landscapes',
    icon: '🌄',
    color: 'from-green-500 to-emerald-500',
    templates: [
      {
        id: 'golden-hour',
        name: 'Golden Hour',
        icon: '🌅',
        prompt: 'Stunning landscape during golden hour, warm orange and pink sky with scattered clouds, sun low on horizon, gentle camera pan across scene, serene peaceful atmosphere, soft natural lighting with long shadows, bird songs and gentle wind sounds, nature at its most beautiful',
        tags: ['sunset', 'peaceful', 'warm', 'scenic'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'ocean-waves',
        name: 'Ocean Waves',
        icon: '🌊',
        prompt: 'Slow motion ocean waves crashing dramatically on pristine beach, aerial drone perspective descending, turquoise crystal clear water, white foam detail, seagull sounds and wave crashes, peaceful ambient music, tropical paradise, smooth cinematic movement',
        tags: ['ocean', 'beach', 'aerial', 'peaceful'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'forest-scene',
        name: 'Forest Light',
        icon: '🌲',
        prompt: 'Magical sunlight filtering through dense forest canopy, visible god rays piercing through trees, gentle camera dolly forward through woodland path, morning mist at ground level, bird songs and rustling leaves, ethereal peaceful atmosphere, rich green colors, fantasy forest aesthetic',
        tags: ['forest', 'magical', 'peaceful', 'nature'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'mountain-vista',
        name: 'Mountain Vista',
        icon: '⛰️',
        prompt: 'Epic mountain range panorama, slow reveal camera movement rising, dramatic clouds moving across peaks, crisp morning light, majestic orchestral music building, snow-capped peaks, vast scale perspective, inspiring cinematic scope',
        tags: ['mountains', 'epic', 'majestic', 'inspiring'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      }
    ]
  },

  urban: {
    name: 'Urban & Architecture',
    icon: '🏙️',
    color: 'from-gray-500 to-slate-600',
    templates: [
      {
        id: 'city-timelapse',
        name: 'City Timelapse',
        icon: '🌃',
        prompt: 'Bustling city street from elevated angle, time-lapse effect showing movement, light trails from traffic, transition from golden hour to blue hour to night, urban energy and rhythm, ambient city sounds with traffic, modern metropolitan life, dynamic composition',
        tags: ['city', 'timelapse', 'urban', 'dynamic'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'architecture',
        name: 'Architecture',
        icon: '🏢',
        prompt: 'Modern building facade architectural detail, geometric patterns and lines, reflections in glass panels, smooth vertical camera tilt movement, minimalist electronic music, clean contemporary design, afternoon sunlight creating shadows, architectural photography style',
        tags: ['architecture', 'geometric', 'modern', 'minimal'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'street-life',
        name: 'Street Life',
        icon: '🚶',
        prompt: 'Vibrant city street life, shallow depth of field isolating subject, colorful bokeh lights in background, candid authentic moments, urban soundscape with voices and traffic, street photography aesthetic, natural available light, human stories unfolding',
        tags: ['street', 'candid', 'urban', 'life'],
        settings: { resolution: '720p', duration: 8, aspectRatio: '16:9' }
      }
    ]
  },

  abstract: {
    name: 'Abstract & Artistic',
    icon: '🎨',
    color: 'from-pink-500 to-rose-500',
    templates: [
      {
        id: 'liquid-motion',
        name: 'Liquid Art',
        icon: '💧',
        prompt: 'Colorful ink dispersing gracefully in water, ultra slow motion capture, vibrant colors mixing and swirling, macro close-up revealing intricate patterns, smooth ambient electronic music, abstract fluid dynamics, mesmerizing organic movement, artistic color palette',
        tags: ['abstract', 'liquid', 'colorful', 'mesmerizing'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'light-patterns',
        name: 'Light Patterns',
        icon: '✨',
        prompt: 'Abstract geometric light patterns moving across surface, neon colors shifting and pulsing, rhythmic synchronized movement, electronic soundtrack with beat, modern digital art aesthetic, bokeh and lens flare effects, hypnotic visual journey',
        tags: ['abstract', 'neon', 'geometric', 'rhythmic'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'particles',
        name: 'Particle Magic',
        icon: '⭐',
        prompt: 'Glowing magical particles floating in dark space, individual bokeh sparkles, smooth ethereal camera drift, mysterious fantasy atmosphere, soft ethereal music with chimes, dreamy aesthetic, depth and dimension, enchanting visual effect',
        tags: ['particles', 'magical', 'ethereal', 'fantasy'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      }
    ]
  },

  seasonal: {
    name: 'Seasonal & Weather',
    icon: '❄️',
    color: 'from-cyan-500 to-blue-500',
    templates: [
      {
        id: 'winter-wonder',
        name: 'Winter Scene',
        icon: '☃️',
        prompt: 'Snowflakes gently falling in slow motion, evergreen trees heavily laden with fresh snow, soft diffused winter light, peaceful serene atmosphere, gentle wind sounds and snow crunching, cozy winter aesthetic, muted color palette with blue tones',
        tags: ['winter', 'snow', 'peaceful', 'cozy'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'summer-vibes',
        name: 'Summer Day',
        icon: '☀️',
        prompt: 'Bright sunny summer day, beautiful lens flare effects from sun, vibrant saturated colors, carefree joyful atmosphere, upbeat cheerful music, clear blue sky with wispy clouds, warm golden sunlight, summer holiday feeling, energetic positive mood',
        tags: ['summer', 'bright', 'cheerful', 'vibrant'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'rain-ambiance',
        name: 'Rainy Day',
        icon: '🌧️',
        prompt: 'Rain drops trickling down window glass, bokeh city lights blurred in background, cozy indoor atmosphere, gentle rain sounds with distant thunder, melancholic contemplative mood, muted colors with blue-gray tones, peaceful rainy day aesthetic',
        tags: ['rain', 'cozy', 'melancholic', 'peaceful'],
        settings: { resolution: '720p', duration: 8, aspectRatio: '16:9' }
      }
    ]
  },

  motion: {
    name: 'Camera Techniques',
    icon: '🎥',
    color: 'from-indigo-500 to-purple-500',
    templates: [
      {
        id: 'slow-motion',
        name: 'Slow Motion',
        icon: '⏱️',
        prompt: 'Ultra slow motion dramatic capture at 240fps, crucial moment frozen beautifully in time, every detail visible, high resolution clarity, cinematic color grading with rich tones, epic orchestral music building intensity, professional cinematography',
        tags: ['slow-motion', 'dramatic', 'cinematic', 'detailed'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'smooth-gimbal',
        name: 'Gimbal Shot',
        icon: '📷',
        prompt: 'Perfectly steady gimbal movement gliding through space, professional cinematography technique, balanced thoughtful composition, smooth continuous motion, ambient atmospheric soundtrack, revealing environment gradually, cinematic production quality',
        tags: ['smooth', 'professional', 'steady', 'cinematic'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'drone-aerial',
        name: 'Drone Aerial',
        icon: '🚁',
        prompt: 'Sweeping aerial drone shot ascending smoothly, revealing vast expansive landscape below, epic bird\'s eye perspective, smooth controlled movement, cinematic orchestral music, breathtaking scale, professional aerial cinematography, stunning vista reveal',
        tags: ['drone', 'aerial', 'epic', 'sweeping'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      }
    ]
  },

  mood: {
    name: 'Moods & Emotions',
    icon: '💫',
    color: 'from-amber-500 to-orange-500',
    templates: [
      {
        id: 'peaceful-calm',
        name: 'Peaceful',
        icon: '🕊️',
        prompt: 'Serene tranquil scene with minimal gentle movement, soft pastel colors, gentle diffused lighting, meditative peaceful atmosphere, calm ambient nature sounds, zen minimalist aesthetic, relaxing therapeutic mood, slow contemplative pacing',
        tags: ['peaceful', 'calm', 'serene', 'meditative'],
        settings: { resolution: '720p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'energetic',
        name: 'Energetic',
        icon: '⚡',
        prompt: 'High energy dynamic movement, vibrant saturated bold colors, fast exciting camera motion, dynamic dramatic lighting changes, upbeat driving music with rhythm, modern kinetic aesthetic, adrenaline rush feeling, youthful vibrant energy',
        tags: ['energetic', 'dynamic', 'vibrant', 'exciting'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'mysterious',
        name: 'Mysterious',
        icon: '🌙',
        prompt: 'Moody atmospheric low-key lighting, deep shadows with hidden details, silhouettes and mystery, fog rolling through scene, mysterious intriguing atmosphere, suspenseful music building tension, noir aesthetic, cinematic intrigue, secrets to uncover',
        tags: ['mysterious', 'moody', 'dark', 'suspenseful'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '16:9' }
      },
      {
        id: 'nostalgic',
        name: 'Nostalgic',
        icon: '📼',
        prompt: 'Vintage film aesthetic with character, warm nostalgic color grade, slight film grain texture, retro atmosphere evoking memories, analog feel and charm, classic soundtrack with strings, sentimental emotional mood, timeless quality, memories preserved',
        tags: ['nostalgic', 'vintage', 'retro', 'sentimental'],
        settings: { resolution: '720p', duration: 8, aspectRatio: '16:9' }
      }
    ]
  },

  promo: {
    name: 'CleverCreator.ai Promos',
    icon: '🚀',
    color: 'from-violet-500 to-fuchsia-500',
    templates: [
      {
        id: 'promo-hook',
        name: 'Attention Hook',
        icon: '⚡',
        prompt: 'Bold neon text "STOP SCROLLING" flashing on screen in electric blue and purple, quick cuts of stunning AI-generated videos cycling rapidly, energetic electronic beat drop, vibrant particles exploding, smooth zoom to CleverCreator.ai logo, vertical mobile format, modern TikTok style, attention-grabbing first 3 seconds, social media viral aesthetic',
        tags: ['hook', 'viral', 'social', 'attention'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-free-signup',
        name: 'FREE Signup',
        icon: '🎁',
        prompt: 'Giant 3D "FREE" text in golden glow rotating center screen, confetti and sparkles exploding from all sides, upbeat celebration music, smooth camera push-in effect, text overlay appearing "Sign Up FREE Today", subtitle "No Credit Card Required" fading in, cheerful vibrant colors, urgent call-to-action aesthetic, vertical format optimized',
        tags: ['free', 'signup', 'cta', 'offer'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-pricing-reveal',
        name: 'New Year Deal',
        icon: '💰',
        prompt: 'Elegant price tag center screen displaying "$19.99/month" in large bold numbers, old price "$49.99" with red strike-through above, golden shimmer effects washing over, New Year fireworks bursting in background, text "NEW YEAR SPECIAL" appearing, countdown timer "Limited Time Only", luxury gold and purple colors, vertical mobile format',
        tags: ['pricing', 'deal', 'newyear', 'offer'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-before-after',
        name: 'Before & After',
        icon: '✨',
        prompt: 'Vertical split screen: left half shows frustrated creator staring at blank screen with dim lighting labeled "BEFORE", right half shows excited creator with beautiful video playing labeled "AFTER", bright vibrant lighting, smooth wipe transition from left to right, uplifting transformation music, text overlay "From Blank to Beautiful in Minutes"',
        tags: ['transformation', 'comparison', 'results', 'before-after'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-platform-intro',
        name: 'Platform Launch',
        icon: '🎉',
        prompt: 'Sleek futuristic tech interface displaying "CleverCreator.ai" logo with glowing blue and purple gradient, smooth zoom into AI dashboard holographic display, floating particles and light rays, upbeat electronic music building energy, text appearing "Transform Ideas into Videos with AI", professional product reveal, vertical format, innovation feeling',
        tags: ['launch', 'platform', 'ai', 'tech'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-time-saver',
        name: 'Save Hours',
        icon: '⏱️',
        prompt: 'Fast-forward clock animation spinning rapidly showing hours passing, stressed person at traditional video editing software looking exhausted, sudden pause and transition, CleverCreator interface appears generating video instantly, happy creator smiling, text "Hours to Minutes with AI", clock icon with saved time displayed, vertical format',
        tags: ['time-saving', 'productivity', 'efficiency', 'fast'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-tutorial-part1',
        name: 'How It Works - Part 1',
        icon: '🎓',
        prompt: 'Clean modern interface, Step 1 appears with number "1" in circle, text "Type Your Idea" with typing animation on keyboard, cursor blinking in text field, words appearing "sunset beach scene", Step 2 number "2" appears, text "AI Creates Magic" with processing animation and loading bar, friendly background music, educational style, vertical format',
        tags: ['tutorial', 'howto', 'guide', 'part1'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-tutorial-part2',
        name: 'How It Works - Part 2',
        icon: '🎓',
        prompt: 'Continuation from Part 1, stunning video preview appearing on screen with play button, Step 3 number "3" in circle appears, text "Download & Share" with checkmark animation, beautiful sunset beach video playing, sharing icons appearing (Instagram, TikTok, YouTube), text overlay "Start Creating Today", call-to-action button, vertical format',
        tags: ['tutorial', 'howto', 'guide', 'part2'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-features-part1',
        name: 'Features - Part 1',
        icon: '⭐',
        prompt: 'Modern smartphone screen vertical format, Feature 1 icon appears "AI Optimize" with lightning bolt, text field transforming from basic to detailed prompt, Feature 2 "Smart Chat" bubble icon appearing, AI assistant helping user, vibrant blue purple gradient UI, smooth transitions, upbeat tech music, text "Powerful AI Features"',
        tags: ['features', 'demo', 'ai', 'part1'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-features-part2',
        name: 'Features - Part 2',
        icon: '⭐',
        prompt: 'Continuing features showcase, Feature 3 "100+ Templates" library grid appearing with template cards floating, Feature 4 "Pro Quality" showing 1080p badge and high-quality video preview, all features icons assembling together, text overlay "Everything You Need to Create", call-to-action "Try Free Today", vertical mobile format',
        tags: ['features', 'demo', 'templates', 'part2'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-benefits',
        name: 'Key Benefits',
        icon: '🎯',
        prompt: 'Animated benefit icons appearing vertically: clock icon bouncing in "Save 10+ Hours", dollar sign icon "Only $19.99/month", brain icon with sparkles "AI Powered Technology", trophy icon "Hollywood Quality Results", each icon with smooth bounce animation, gradient backgrounds cycling purple to blue, motivational music, vertical format',
        tags: ['benefits', 'value', 'advantages', 'features'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-social-proof',
        name: 'User Testimonial',
        icon: '💬',
        prompt: 'Happy content creator in clean studio setup holding phone vertically showing CleverCreator app, smiling at camera, soft professional lighting, gentle camera push-in, text quote appearing "This changed my content game!" with 5 stars, authentic documentary feel, ambient inspirational music, professional yet approachable mood, vertical format',
        tags: ['testimonial', 'social-proof', 'user', 'review'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-premium-upgrade',
        name: 'Upgrade to Premium',
        icon: '👑',
        prompt: 'Vertical comparison graphic, top half "FREE PLAN" with basic features listed, animated divider line, bottom half "PREMIUM $19.99/M" in gold with premium features unlocking with golden glow, unlock animation with key turning, text "Unlimited Videos • All Templates • Priority Support", upgrade button pulsing, luxury aesthetic',
        tags: ['premium', 'upgrade', 'pricing', 'comparison'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-templates-showcase',
        name: 'Template Library',
        icon: '📚',
        prompt: 'Virtual library shelves appearing vertically, colorful template cards flying out and arranging in grid, each card showing animated preview thumbnail of different video styles: cinematic, product, nature, abstract, smooth camera drift upward through organized categories, text "100+ Ready-Made Templates" appearing, inspiring background music, vertical format',
        tags: ['templates', 'library', 'collection', 'variety'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-creative-freedom',
        name: 'Unlimited Creativity',
        icon: '🎨',
        prompt: 'Artist painting on canvas transforms into digital AI interface, paint strokes morphing into code and data streams, colorful creative explosion of particles, organized template library emerging from chaos, inspiring orchestral music swelling, text "Your Imagination, Unlimited Possibilities" appearing, empowering artistic aesthetic, vertical mobile format',
        tags: ['creative', 'artistic', 'freedom', 'unlimited'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-quality-showcase',
        name: 'Pro Quality Results',
        icon: '🏆',
        prompt: 'Premium smartphone held vertically displaying stunning AI-generated video in full screen, camera slowly rotating around phone showing video from different angles, "1080p HD" badge appearing, "Professional Quality" text overlay, soft premium lighting, sophisticated ambient music, luxury aesthetic, vertical format optimized for social sharing',
        tags: ['quality', 'professional', 'premium', 'results'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-new-year-countdown',
        name: '2025 Celebration',
        icon: '🎊',
        prompt: 'Spectacular 2025 New Year scene, giant glowing "2025" numbers in gold and purple, champagne bottle popping with particle effects, fireworks exploding upward in night sky, countdown timer "3...2...1", text overlay "NEW YEAR SPECIAL" appearing, "Start Creating Today - Limited Time", festive celebration music, urgent excitement mood, vertical format',
        tags: ['newyear', 'celebration', 'limited', 'special'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-cta-signup',
        name: 'Sign Up Now',
        icon: '🚀',
        prompt: 'Bold call-to-action screen with pulsing "SIGN UP NOW" button in center, arrow pointing down, glowing effects around button, text above "Start Creating Professional Videos", text below "100% FREE - No Credit Card", confetti falling from top, energetic music with urgency, bright vibrant colors, vertical format, conversion-focused design',
        tags: ['cta', 'signup', 'action', 'conversion'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-text-to-video',
        name: 'Text to Video Feature',
        icon: '✍️',
        prompt: 'Vertical smartphone screen showing typing animation with text "sunset over mountains" appearing in text field, magical transformation effect as text morphs into stunning video playing, golden hour mountain landscape visible, text overlay "TEXT TO VIDEO" appearing with sparkle effects, smooth transition animation, upbeat tech music, vertical mobile format',
        tags: ['feature', 'text-to-video', 'ai', 'popular'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-image-to-video',
        name: 'Image to Video Feature',
        icon: '🖼️',
        prompt: 'Static photo displayed on screen suddenly coming to life with smooth animation, camera panning across the scene, elements moving naturally, text "IMAGE TO VIDEO" appearing with "NEW" badge glowing, photo transforming into cinematic video clip, dynamic movement from still image, exciting reveal music, vertical format optimized',
        tags: ['feature', 'image-to-video', 'ai', 'new'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-ai-features-overview',
        name: 'AI Features Showcase',
        icon: '🤖',
        prompt: 'Vertical grid showing multiple AI features animating: "TEXT TO VIDEO" with typing animation, "IMAGE TO VIDEO" with photo coming alive, "SKETCH TO REAL" with drawing transforming, "AI ENHANCE" with quality upgrade visual, each feature icon appearing sequentially with smooth bounce, vibrant gradient backgrounds, text "Powered by Advanced AI", modern tech aesthetic',
        tags: ['features', 'ai', 'showcase', 'overview'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-sketch-to-real',
        name: 'Sketch to Real',
        icon: '🎨',
        prompt: 'Hand-drawn sketch on paper transforming magically into photorealistic video, pencil lines morphing into vivid colors and realistic textures, smooth transition from simple drawing to professional quality video, text "SKETCH TO REAL" appearing, "BETA" badge visible, artistic transformation effect, inspiring music, vertical mobile format',
        tags: ['feature', 'sketch', 'ai', 'beta'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-all-in-one',
        name: 'All-in-One Platform',
        icon: '⚡',
        prompt: 'Multiple feature cards floating and rotating in 3D space vertically: Text to Video, Image to Video, AI Chat, Templates, each card showing mini preview animation, cards assembling together forming "CleverCreator.ai" logo, text "ALL-IN-ONE AI VIDEO PLATFORM" appearing, dynamic camera movement, energetic electronic music, comprehensive showcase',
        tags: ['platform', 'features', 'all-in-one', 'complete'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      },
      {
        id: 'promo-ai-powered',
        name: 'AI Technology',
        icon: '🧠',
        prompt: 'Futuristic neural network visualization with glowing nodes and connections, data streams flowing, AI brain processing information, text "POWERED BY ADVANCED AI" appearing with tech font, transformation from raw input to polished video output shown, blue and purple tech colors, sophisticated electronic music, cutting-edge technology aesthetic, vertical format',
        tags: ['ai', 'technology', 'advanced', 'innovation'],
        settings: { resolution: '1080p', duration: 8, aspectRatio: '9:16' }
      }
    ]
  }
};

// Helper function to get all templates as flat array
export const getAllTemplates = () => {
  return Object.values(promptTemplates).flatMap(category =>
    category.templates.map(template => ({
      ...template,
      category: category.name,
      categoryIcon: category.icon
    }))
  );
};

// Helper function to search templates
export const searchTemplates = (query) => {
  const allTemplates = getAllTemplates();
  const lowerQuery = query.toLowerCase();

  return allTemplates.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.prompt.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
