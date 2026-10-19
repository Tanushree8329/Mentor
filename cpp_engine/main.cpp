#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <cmath>
#include <sstream>
#include <algorithm>

using namespace std;

// JSON escape helper
string escapeJson(const string& s) {
    string escaped;
    for (char c : s) {
        switch(c) {
            case '"': escaped += "\\\""; break;
            case '\\': escaped += "\\\\"; break;
            case '\n': escaped += "\\n"; break;
            case '\r': escaped += "\\r"; break;
            case '\t': escaped += "\\t"; break;
            default: escaped += c;
        }
    }
    return escaped;
}

struct Lesson {
    string id;
    string title;
    string category;
    string content;
    string examples;
    string exercises;
};

struct CompositionPrinciple {
    string id;
    string title;
    string definition;
    string why_it_works;
    string when_to_use;
    string example;
    string exercise;
    string common_mistakes;
    string breaking_rule;
};

struct QuizQuestion {
    string question;
    vector<string> options;
    int correct_answer;
    string explanation;
};

// Photography Lessons Database
vector<Lesson> getLessons() {
    return {
        {"L001", "Aperture", "Exposure", 
         "Aperture is the opening in your lens that controls how much light enters the camera. It's measured in f-stops (f/1.4, f/2.8, f/5.6, f/11, f/22, etc.). A smaller f-number means a larger opening and more light. Aperture also affects depth of field - the area in focus in your image.",
         "Portrait at f/1.8: Background is beautifully blurred. Landscape at f/11: Everything from foreground to background is sharp.",
         "Take 3 photos of the same subject at f/2.8, f/8, and f/16. Notice how the background changes from blurry to sharp."},
        
        {"L002", "Shutter Speed", "Exposure",
         "Shutter speed is how long your camera's sensor is exposed to light, measured in seconds or fractions (1/4000s, 1/250s, 1/30s, 1s, 30s). Fast shutter speeds freeze motion. Slow shutter speeds create motion blur. As a rule, use a shutter speed faster than your focal length to avoid camera shake (e.g., 1/100s for a 50mm lens).",
         "Sports at 1/1000s: Athletes frozen mid-action. Waterfall at 2s: Water looks silky smooth.",
         "Photograph a moving car. Try 1/1000s to freeze it, then 1/30s to show motion blur. Use a tripod for slower speeds."},
        
        {"L003", "ISO", "Exposure",
         "ISO controls your camera's sensitivity to light. Low ISO (100-400) produces clean images but needs more light. High ISO (1600-6400+) brightens dark scenes but adds noise/grain. Always use the lowest ISO that gives proper exposure.",
         "Sunny day at ISO 100: Clean, detailed image. Dark room at ISO 3200: Brighter but grainy image.",
         "Photograph a room. Start at ISO 100, then increase to 400, 1600, 3200. Compare noise levels when zoomed in."},
        
        {"L004", "Exposure Triangle", "Exposure",
         "The exposure triangle combines aperture, shutter speed, and ISO. Changing one affects exposure, so you must adjust others to compensate. Wide aperture (more light) + fast shutter (less light) + low ISO = balanced exposure. This relationship is fundamental to manual photography.",
         "Bright beach: f/11, 1/500s, ISO 100. Dark concert: f/2.8, 1/125s, ISO 3200.",
         "Set your camera to Manual mode. Take a properly exposed photo, then change aperture by 2 stops and adjust shutter speed to maintain exposure."},
        
        {"L005", "Exposure Compensation", "Exposure",
         "Exposure compensation (+/-) overrides your camera's automatic exposure meter. Use +1 or +2 to brighten snow scenes or backlit subjects. Use -1 or -2 to darken and preserve detail in bright areas. It's essential when your camera's meter gets fooled.",
         "Snow scene without compensation: Gray and underexposed. With +1.5 EV: Bright and white as it should be.",
         "Photograph something white (paper, wall) and something black (jacket, bag). Use exposure compensation to make whites bright and blacks dark."},
        
        {"L006", "Metering Modes", "Camera Skills",
         "Metering modes determine how your camera measures light. Matrix/Evaluative: averages entire scene (default). Center-weighted: prioritizes center area. Spot: measures only a small point (precise but requires practice). Choose based on your subject and lighting.",
         "Backlit portrait: Spot meter on face ensures proper skin tones. Landscape: Matrix metering balances sky and ground.",
         "Set spot metering. Photograph a person against a bright window. Meter on their face, not the window."},
        
        {"L007", "Histogram", "Camera Skills",
         "A histogram shows the distribution of tones in your image from shadows (left) to highlights (right). A good histogram uses most of the range without clipping (spiking at edges). Expose to the right (ETTR) when possible - brighter is better for detail, as long as highlights aren't blown.",
         "Proper exposure: Histogram is well-distributed. Underexposed: Histogram bunched on left. Overexposed: Histogram clipped on right.",
         "Take 5 photos of the same scene with different exposures. Review histograms and identify the best-exposed image."},
        
        {"L008", "Focus and Autofocus", "Camera Skills",
         "Focus determines what appears sharp. Autofocus (AF) modes: Single/One-shot (still subjects), Continuous/AI Servo (moving subjects), Auto (camera decides). Focus points: use single-point for precision, zone/group for action. Always focus on your subject's eyes in portraits.",
         "Portrait: Single-point AF on near eye. Sports: Continuous AF with zone focusing tracks moving athletes.",
         "Practice single-point AF: photograph a flower, placing focus point exactly on the center. Then try continuous AF on someone walking toward you."},
        
        {"L009", "Depth of Field", "Exposure",
         "Depth of field (DOF) is the zone of acceptable sharpness. Shallow DOF (wide aperture like f/1.8): subject sharp, background blurred. Deep DOF (narrow aperture like f/16): everything sharp. DOF is also affected by focal length (longer = shallower) and subject distance (closer = shallower).",
         "Portrait at f/1.4 and 85mm: Creamy background blur isolates subject. Landscape at f/11 and 24mm: Sharpness from foreground rocks to distant mountains.",
         "Photograph a row of objects (bottles, books). Use f/2.8 to blur all but the nearest. Then f/16 to make all sharp."},
        
        {"L010", "Focal Length", "Lenses",
         "Focal length (measured in mm) determines field of view. Wide-angle (14-35mm): expansive view, includes more scene, exaggerates perspective. Standard (40-60mm): natural view similar to human eye. Telephoto (70-300mm+): magnifies distant subjects, compresses perspective. Focal length also affects depth of field.",
         "24mm: Entire room fits in frame. 50mm: Natural perspective for street photography. 200mm: Distant bird fills frame.",
         "If you have a zoom lens, photograph the same subject at 24mm, 50mm, and 100mm from different distances to keep the subject the same size. Notice perspective changes."},
        
        {"L011", "Lens Types", "Lenses",
         "Prime lenses (fixed focal length like 50mm): sharper, wider aperture (f/1.4-f/2), lighter, but less versatile. Zoom lenses (variable like 24-70mm): convenient, versatile, but usually slower (f/3.5-f/5.6) and heavier. Wide-angle distorts, telephoto compresses. Macro lenses for extreme close-ups.",
         "50mm f/1.8 prime: Sharp portraits with beautiful blur. 24-105mm zoom: One lens for landscapes and portraits.",
         "Research lens options for your camera. Understand which focal lengths suit your photography style."},
        
        {"L012", "White Balance", "Light & Colour",
         "White balance (WB) adjusts colors to look natural under different light sources. Daylight (5500K): neutral outdoors. Tungsten (3200K): corrects warm indoor bulbs. Fluorescent (4000K): corrects green cast. Cloudy/Shade (6000K+): adds warmth. Auto WB works most of the time, but manual control gives creative control.",
         "Indoor photo with Auto WB: May look orange. With Tungsten WB: Colors appear neutral.",
         "Photograph the same scene with Daylight, Tungsten, and Cloudy white balance. Compare the color temperature."},
        
        {"L013", "Understanding Light", "Light & Colour",
         "Light quality and direction shape your image. Hard light (direct sun, flash): strong shadows, high contrast. Soft light (cloudy day, diffused): gentle shadows, low contrast. Front light: even but flat. Side light: reveals texture and dimension. Backlight: creates silhouettes or rim light. Golden hour (sunrise/sunset): warm, flattering light.",
         "Harsh midday sun: Hard shadows under eyes. Golden hour: Warm, glowing skin tones. Overcast: Soft, even portraits.",
         "Photograph a person in 4 lighting positions: facing sun, sun behind them, sun to the side, in shade. Compare results."},
        
        {"L014", "Composition Basics", "Composition",
         "Composition is how you arrange elements in your frame. Good composition guides the viewer's eye, creates balance, and tells a story. Key principles: rule of thirds, leading lines, framing, symmetry, negative space, patterns. Composition is often more important than technical settings.",
         "Centered subject: static. Subject on thirds intersection: dynamic and engaging.",
         "Before pressing shutter, ask: Where is my subject? What's in the background? Where do I want the viewer's eye to go?"},
        
        {"L015", "Perspective and Angles", "Composition",
         "Perspective changes dramatically with camera position. Eye level: neutral, familiar. Low angle (looking up): makes subject powerful, dramatic. High angle (looking down): makes subject vulnerable, shows patterns. Get close, get far, move around - perspective is your creative tool.",
         "Portrait from above: Slimming, emphasizes eyes. Portrait from below: Dramatic, powerful, emphasizes chin.",
         "Photograph a building from ground level, eye level, and from above (if safe). Notice how it changes from imposing to ordinary to patterned."},
        
        {"L016", "Portrait Photography", "Photography Genres",
         "Portraits capture personality. Use 50-135mm focal length for flattering perspective. Wide aperture (f/1.8-f/4) blurs background. Focus on nearest eye. Use soft natural light or off-camera flash. Engage with your subject, direct poses, capture genuine moments. Background should complement, not distract.",
         "85mm f/1.8: Sharp eyes, creamy background. Soft window light from side: Flattering, dimensional.",
         "Take a portrait of a friend. Use a longer lens (70mm+), wide aperture (f/2.8 or wider), and window light. Focus on their eyes."},
        
        {"L017", "Landscape Photography", "Photography Genres",
         "Landscapes showcase nature's beauty. Use wide-angle lenses (16-35mm), narrow aperture (f/8-f/16) for sharpness throughout, low ISO for clean images. Shoot during golden hour or blue hour. Include foreground interest. Use tripod for long exposures. Polarizing filter enhances skies.",
         "24mm f/11: Sharp from foreground flowers to distant mountains. Golden hour: Warm, directional light adds depth.",
         "Find a scenic location. Include foreground (rocks, flowers), midground (trees, lake), and background (mountains, sky). Shoot at f/11."},
        
        {"L018", "Street Photography", "Photography Genres",
         "Street photography captures candid moments in public. Use 28-50mm for natural perspective. Stay discreet, anticipate moments, shoot from hip or eye level. Look for interesting light, characters, juxtapositions, decisive moments. Settings: f/5.6-f/8 for DOF, 1/250s+ to freeze motion, Auto ISO.",
         "35mm f/8: Captures scene with context. Decisive moment: Person stepping into puddle reflection.",
         "Walk through a busy area. Photograph people, interactions, light and shadow, reflections. Focus on storytelling moments."},
        
        {"L019", "Macro Photography", "Photography Genres",
         "Macro photography captures extreme close-ups. Requires macro lens or extension tubes. Depth of field is razor-thin, so use f/8-f/16. Use tripod for stability, manual focus for precision. Diffused natural light or ring flash. Focus on eyes in insects, details in flowers.",
         "100mm macro f/11: Water droplet on flower petal shows reflection. Insect: Compound eyes in sharp detail.",
         "Photograph a flower, coin, or small object up close. Use smallest focusing distance. Notice how shallow depth of field becomes."},
        
        {"L020", "HDR Photography", "Advanced Techniques",
         "HDR (High Dynamic Range) combines multiple exposures to capture detail in both shadows and highlights. Take 3-5 bracketed exposures (normal, underexposed, overexposed), merge in post. Use for high-contrast scenes like sunsets, interiors with windows. Don't overdo it - natural HDR is best.",
         "Single exposure: Sky perfect but foreground dark, or foreground perfect but sky blown. HDR: Both have detail.",
         "Photograph a scene with bright sky and dark foreground. Take 3 photos: normal, -2EV, +2EV. Merge in free software like Luminance HDR."},
        
        {"L021", "RAW vs JPEG", "Camera Skills",
         "RAW is unprocessed sensor data with maximum editing flexibility. Large files, requires processing. JPEG is processed, compressed image. Smaller files, ready to share, but less editing headroom. Shoot RAW for important work where you'll edit. JPEG for snapshots or when storage is limited.",
         "RAW: Recover blown highlights, adjust white balance perfectly. JPEG: Limited recovery, baked-in processing.",
         "Take the same photo in RAW and JPEG. In editing software, try recovering highlights and adjusting white balance. Notice RAW's flexibility."},
        
        {"L022", "Camera Modes", "Camera Skills",
         "Auto: Camera controls everything. P (Program): Camera sets aperture and shutter, you adjust. A/Av (Aperture Priority): You set aperture, camera sets shutter. S/Tv (Shutter Priority): You set shutter, camera sets aperture. M (Manual): You control everything. Start with Aperture Priority, progress to Manual.",
         "Aperture Priority for portraits: Set f/2.8, camera picks shutter. Manual for studio: Full control of light.",
         "Switch to Aperture Priority. Set f/5.6. Take photos in different lighting. Notice camera adjusts shutter speed automatically."},
        
        {"L023", "Manual Mode", "Camera Skills",
         "Manual mode gives complete creative control. Set aperture for depth of field, shutter speed for motion, ISO for brightness. Check exposure meter in viewfinder - aim for center (0). Adjust settings until exposure looks right. Manual is essential for studio, long exposure, and consistent lighting.",
         "Studio with flash: M mode prevents ambient light changes from affecting exposure. Long exposure: M mode allows 30s+ with Bulb.",
         "Set Manual mode. Photograph a still subject. Adjust aperture, shutter, ISO until exposure meter shows 0. Take photo, review, refine."},
        
        {"L024", "Motion Blur and Panning", "Advanced Techniques",
         "Slow shutter speeds (1/30s or slower) create motion blur. Static camera: moving subject blurs, background sharp (shows speed). Panning: follow moving subject with camera at ~1/30s - subject sharp, background blurred (conveys motion). Use for cars, bikes, sports.",
         "Car at 1/15s, panned: Car relatively sharp, background streaked horizontally.",
         "Photograph a moving cyclist. Pan your camera to follow them at 1/30s. Takes practice - try multiple times."},
        
        {"L025", "Freezing Motion", "Advanced Techniques",
         "Fast shutter speeds (1/500s+) freeze motion. Sports: 1/1000s. Wildlife: 1/1000-1/2000s. Water droplets: 1/2000s+. Flash: freezes motion even with slower shutter (flash duration is ~1/1000s). Increase ISO if needed to achieve fast shutter.",
         "Bird in flight at 1/2000s: Wings frozen mid-flap. Splash at 1/4000s: Individual droplets suspended.",
         "Photograph splashing water (faucet, thrown water). Use 1/1000s or faster. Freeze the droplets in mid-air."},
        
        {"L026", "Low-Light Photography", "Advanced Techniques",
         "Low-light challenges: not enough light for proper exposure. Solutions: wide aperture (f/1.8-f/2.8), slower shutter (use tripod below 1/60s), higher ISO (accept some noise), add light (flash, LED). Image stabilization helps. Embrace darkness - don't overexpose.",
         "Night street: f/1.8, 1/60s, ISO 3200. Concert: f/2.8, 1/125s, ISO 6400.",
         "Photograph a dimly lit room without flash. Try f/2.8, 1/60s, ISO 1600. Adjust as needed. Use wall/table for stability."},
        
        {"L027", "Colour Theory", "Light & Colour",
         "Colour affects mood and composition. Complementary colours (opposite on colour wheel - blue/orange, red/green): create vibrant contrast. Analogous colours (adjacent - blue/cyan/green): harmonious. Warm colours (red, orange, yellow): energetic, advance. Cool colours (blue, green, purple): calm, recede.",
         "Sunset: Warm orange sky with cool blue shadows creates depth. Red umbrella in green forest: Eye drawn to complementary contrast.",
         "Find a scene with two complementary colours. Photograph it emphasizing the colour contrast."},
        
        {"L028", "Natural Light Photography", "Light & Colour",
         "Master natural light: it's free and beautiful. Golden hour (hour after sunrise, before sunset): warm, soft, directional. Blue hour (twilight): cool, even. Overcast: giant softbox, perfect for portraits. Window light: directional, controllable with curtains. Shade: soft, avoid harsh shadows.",
         "Overcast portrait: Soft, even skin tones. Golden hour landscape: Warm, long shadows, dimension.",
         "Photograph a portrait using only window light. Position subject near window, turn them toward light. Try sheer curtain for diffusion."},
        
        {"L029", "Smartphone Photography", "Photography Genres",
         "Smartphone cameras are capable tools. Tips: Clean lens. Use gridlines (rule of thirds). Tap to focus and expose. Avoid digital zoom (move closer instead). Shoot in good light. Use portrait mode for blur. Edit with apps like Snapseed, Lightroom Mobile. Composition matters more than megapixels.",
         "iPhone portrait mode: Convincing background blur. Google Pixel night mode: Bright low-light photos.",
         "Take 10 photos with your phone today. Focus on composition: rule of thirds, leading lines, interesting light. Edit your favourite."},
        
        {"L030", "Common Photography Mistakes", "Camera Skills",
         "Mistakes to avoid: Not focusing on the right spot (eyes in portraits). Shooting in harsh midday sun (use golden hour/shade). Cluttered backgrounds (simplify). Camera shake at slow shutter (use tripod/faster shutter). Center-placing every subject (use rule of thirds). Not checking settings from previous shoot. Not reviewing images. Fixing these instantly improves photos.",
         "Mistake: Out-of-focus eyes. Fix: Use single-point AF on nearest eye. Mistake: Blurry image. Fix: Use faster shutter or tripod.",
         "Review your last 20 photos. Identify your most common mistake. Spend a week consciously avoiding it."}
    };
}

// Composition Principles Database
vector<CompositionPrinciple> getCompositionPrinciples() {
    return {
        {"C001", "Rule of Thirds",
         "Divide your frame into a 3x3 grid with two horizontal and two vertical lines. Place your subject or key elements along these lines or at their intersections (called power points).",
         "The rule of thirds creates balanced, dynamic compositions that feel natural to the human eye. It prevents centered, static compositions and guides the viewer's gaze effectively.",
         "Use for landscapes (horizon on top or bottom third), portraits (eyes on upper third intersection), any scene where you want visual interest.",
         "Portrait with eyes at top-right intersection creates space for the subject to 'look into'. Landscape with horizon on lower third emphasizes dramatic sky.",
         "Take 5 photos: place your main subject at each of the four intersection points, and one centered for comparison. See which feels most dynamic.",
         "Always centering subjects, resulting in static, bulletin-board style photos. Remember: the rule is a guideline, not a law.",
         "Center subjects deliberately for symmetry, reflection shots, or to create formality and stability."
        },
        {"C002", "Golden Ratio and Golden Spiral",
         "The golden ratio (1.618:1) is a mathematical proportion found in nature. The golden spiral guides composition along a curved path that draws the eye naturally toward the focal point.",
         "This ancient proportion appears in shells, galaxies, and classic art. It creates organic, harmonious compositions that feel inherently pleasing.",
         "Use for natural scenes, portraits where the subject curves or turns, landscapes with winding paths or rivers.",
         "Landscape with winding river placed along golden spiral leads eye through frame. Portrait with face positioned at spiral's center creates elegant composition.",
         "Study famous paintings and photographs. Overlay a golden spiral. Notice how masters positioned key elements along the curve.",
         "Overthinking it. The golden ratio is subtler than rule of thirds - use it as gentle guidance, not rigid structure.",
         "Ignore mathematical precision and trust your eye. Perfect golden ratios aren't required for great photos."
        },
        {"C003", "Symmetry",
         "Symmetry occurs when elements are mirrored across an axis (vertical, horizontal, or radial). Perfect symmetry creates order, stability, and calm.",
         "Human brains find symmetry satisfying and recognizable. It conveys balance, formality, and intentionality.",
         "Architecture, reflections in water, formal portraits, patterns, centered subjects with equal weight on both sides.",
         "Building centered in frame with identical sides creates powerful, formal composition. Person reflected in still lake creates peaceful symmetry.",
         "Find a reflective surface (puddle, window, lake). Photograph a subject centered so the reflection creates perfect symmetry.",
         "Not aligning the symmetry axis properly - use gridlines. Slight imbalances break the effect.",
         "Introduce deliberate asymmetry (one bird landing in mirrored scene) to create tension and interest."
        },
        {"C004", "Asymmetrical Balance",
         "Balance visual weight without mirroring elements. A small bright object can balance a large dark area. Achieved through colour, size, position, and visual interest.",
         "Asymmetry feels dynamic and natural while maintaining equilibrium. More visually interesting than symmetry but requires careful consideration.",
         "When you want energy and movement while keeping composition balanced. Most real-world scenes.",
         "Large dark tree on left balanced by small bright sun on right. Person on one third balanced by empty space they're looking toward.",
         "Place a large object on one side of frame. Balance it with a smaller but brighter or more detailed object on the other side.",
         "Confusing asymmetry with imbalance. The frame should still feel stable, just not mirrored.",
         "Create intentional imbalance for discomfort or tension in conceptual work."
        },
        {"C005", "Leading Lines",
         "Lines (roads, rivers, fences, shadows) that guide the viewer's eye through the image toward your subject or through the scene.",
         "Lines create depth, dimension, and narrative flow. They direct attention deliberately and create journey through the frame.",
         "Landscapes with paths or rivers, architecture, streets, any scene with natural or man-made linear elements.",
         "Road leading from foreground to distant mountain guides eye deep into scene. Staircase railing leads to person at top.",
         "Find a path, railroad track, or hallway. Position yourself so the lines lead from near corner toward your subject in the distance.",
         "Lines that lead nowhere or out of frame. Ensure lines guide toward your subject or through the scene purposefully.",
         "Use converging lines to lead out of frame for a sense of journey or escape."
        },
        {"C006", "Natural Framing",
         "Use elements within the scene (archways, windows, tree branches, doorways) to frame your subject, creating a picture within a picture.",
         "Frames focus attention, add depth by including foreground elements, provide context, and create layered compositions.",
         "Architecture photography, portraits through windows or doorways, landscapes with overhanging branches.",
         "Person framed by archway adds depth and context. Landscape viewed through cave opening creates sense of discovery.",
         "Find a natural frame (window, doorway, archway, tree branches). Photograph a subject or scene through it. Focus on subject, not frame.",
         "Frame too prominent or distracting. The frame should complement and direct, not compete with the main subject.",
         "Use unconventional frames (legs, hands, mechanical elements) for creative or edgy effects."
        },
        {"C007", "Negative Space",
         "Empty or unoccupied space around your subject. Gives subject room to breathe and emphasizes isolation, scale, or mood.",
         "Negative space creates minimalism, draws maximum attention to subject, conveys emotion (loneliness, freedom, contemplation), and provides visual rest.",
         "Minimalist photos, emphasizing isolation or scale, creating calm or contemplative mood, giving directional space for subjects in motion or looking.",
         "Tiny person in vast landscape emphasizes scale. Subject in lower corner with empty sky creates contemplative mood.",
         "Photograph a small subject with 70-80% of frame empty. Experiment with where you place the subject in the remaining space.",
         "Too much negative space making subject lost or insignificant. Balance is key.",
         "Fill the frame completely for intensity, intimacy, or overwhelming presence."
        },
        {"C008", "Minimalism",
         "Simplify composition to bare essentials. Remove anything that doesn't contribute to your message. Often combined with negative space.",
         "Minimalism is powerful. It forces viewer to focus on what remains. Creates calm, sophistication, and clarity.",
         "Abstract photography, emphasizing form and colour, creating peaceful or meditative images, modern aesthetic.",
         "Single leaf on white background. Lone bench on empty beach. One bird in vast sky.",
         "Find a simple subject. Eliminate all distractions - use plain background, tight crop, or negative space. Keep only essential elements.",
         "Boring minimalism - subject must still be interesting. Empty isn't automatically good.",
         "Add one carefully chosen additional element to create relationship or tension."
        },
        {"C009", "Patterns and Repetition",
         "Repeating elements (shapes, colours, lines, textures) create rhythm and visual interest. Pattern fills frame or extends beyond it.",
         "Human eye is drawn to patterns and finds them satisfying. Repetition creates order, rhythm, and can be mesmerizing.",
         "Architecture, nature (leaves, waves), aerial photography, textiles, crowds, graphic compositions.",
         "Grid of windows on building facade. Rows of colorful beach umbrellas. Repeating arches in colonnade.",
         "Find a repeating pattern (tiles, fence posts, crops, windows). Photograph it filling the frame to emphasize repetition.",
         "Patterns without a focal point become wallpaper. Consider including a break in the pattern for interest.",
         "Deliberately break the pattern with one contrasting element to create focal point and narrative."
        },
        {"C010", "Rhythm",
         "Similar to patterns but with variation in spacing, size, or intensity. Creates visual flow and movement through repetition with differences.",
         "Rhythm guides the eye through the image dynamically, creating energy while maintaining coherence.",
         "Sequences of similar but not identical elements - fence posts getting smaller with distance, waves, musical subjects.",
         "Row of trees diminishing into distance creates rhythm and depth. Alternating light and shadow stripes on stairs.",
         "Photograph a sequence of similar objects (posts, people, cars) with natural variation in size or spacing.",
         "Confusing chaotic spacing with rhythm. Rhythm has flow; chaos doesn't.",
         "Use irregular rhythm (jazz-like) for energetic, unpredictable compositions."
        },
        {"C011", "Contrast and Juxtaposition",
         "Place opposing elements together: old vs new, large vs small, light vs dark, rough vs smooth, warm vs cool colours. Contrast creates visual impact and meaning.",
         "Contrast attracts attention, creates drama, and can convey narrative or commentary through comparison.",
         "Street photography, conceptual work, emphasizing differences, creating visual drama.",
         "Modern building next to ancient ruin. Elderly person beside child. Bright flower in industrial wasteland.",
         "Find two contrasting subjects in one scene. Photograph them together, emphasizing their differences.",
         "Contrasts that are unclear or weak. The difference should be obvious and meaningful.",
         "Use subtle contrast (different textures of similar colours) for sophisticated, understated effects."
        },
        {"C012", "Foreground, Midground, Background",
         "Create depth by including distinct layers at different distances. Foreground anchors viewer, midground contains main subject, background provides context.",
         "Layering creates three-dimensional feel in two-dimensional image. Adds depth, scale, and complexity.",
         "Landscapes (essential), environmental portraits, travel photography, any scene where depth matters.",
         "Flowers in foreground, person in midground, mountains in background creates dimensional landscape. Frame with layers tells richer story than flat single-plane image.",
         "Find a scene with clear depth. Include something close (rocks, flowers), middle distance (trees, buildings), and far (mountains, sky). Use f/11 for sharpness throughout.",
         "Ignoring foreground - it anchors the image and provides entry point. Don't leave it empty or boring.",
         "Blur foreground deliberately (wide aperture) to create depth while keeping attention on midground subject."
        },
        {"C013", "Viewpoint and Perspective",
         "Your camera position dramatically changes the image. Low angle (worm's eye view), high angle (bird's eye view), eye level, or unusual angles create different feelings.",
         "Changing viewpoint transforms ordinary subjects. Height affects perceived power, drama, and visual interest.",
         "Portraits (angle changes face shape), architecture, showing scale, creating drama, revealing patterns from above.",
         "Child photographed from adult eye level: disengaged. From child's eye level: intimate connection. Building from ground: imposing. From above: reveals roof pattern.",
         "Photograph the same subject from 5 positions: ground level, your eye level, above subject, far away, very close. Compare the feelings.",
         "Lazy eye-level shooting for everything. Move up, down, closer, farther. Explore actively.",
         "Use deliberate, boring eye-level perspective for documentary neutrality and objectivity."
        },
        {"C014", "Focal Point and Visual Hierarchy",
         "Every image needs a clear subject or focal point where the eye lands first. Visual hierarchy guides the eye through secondary elements in order of importance.",
         "Without a clear subject, images feel aimless. Hierarchy creates narrative flow and ensures viewers see what you intend.",
         "All photography. Identify what's most important, make it prominent through position, focus, light, or contrast.",
         "Portrait: Eyes are focal point (sharpest, brightest). Then face, then body, then background. Clear hierarchy guides viewer through image.",
         "Review your photos. Ask: where does my eye land first? Is that what I intended? If not, identify what's competing for attention.",
         "Multiple competing focal points confuse the viewer. Simplify - one clear subject, everything else supports it.",
         "Create multiple equal focal points deliberately for chaos, complexity, or Where's Waldo effect."
        },
        {"C015", "Triangles and Geometric Shapes",
         "Arrange elements to form triangles (most stable shape), circles, diagonals, or other geometry. Triangles are especially powerful - dynamic yet balanced.",
         "Geometric compositions feel intentional and strong. Triangles guide the eye and create stability through their three points.",
         "Group portraits (arrange people in triangle), architecture, any composition with three main elements.",
         "Three people arranged with heads forming triangle creates stable, pleasing group portrait. Mountain peak forms natural triangle leading eye upward.",
         "Photograph three objects or people. Position them so they form a triangle. Try different orientations (base down = stable, point up = upward energy).",
         "Accidental, weak triangles that aren't clear. Make geometric shapes obvious and intentional.",
         "Use chaotic, irregular arrangements for energy, discomfort, or natural randomness."
        },
        {"C016", "Look Room and Lead Room",
         "When subject is looking or moving in a direction, leave space in front of them (in the direction they're facing or moving), not behind. This feels natural and comfortable.",
         "Viewers unconsciously want to see where the subject is looking or going. Space in front provides this; lack of it feels cramped and awkward.",
         "Portraits of people looking off-camera, moving subjects (cars, athletes, animals), any directional composition.",
         "Person looking right: position them on left third, giving look room on right. Runner moving left: place on right side of frame with space ahead.",
         "Photograph someone looking to the side. First, position them with space behind their gaze (awkward). Then with space in front (comfortable). Feel the difference.",
         "Not leaving enough look room, making composition feel cramped and tense.",
         "Deliberately place subject with no look room for tension, claustrophobia, or trapped feeling."
        },
        {"C017", "Scale and Proportion",
         "Show relative size by including reference objects (person in landscape, hand holding object). Proportion is relationship between element sizes within frame.",
         "Scale creates impact, context, and understanding. Huge without reference is just big; huge with tiny person is dramatic.",
         "Emphasizing grandeur (mountains, buildings), showing tiny details, creating awe, providing context.",
         "Tiny person in vast canyon shows scale dramatically. Hand holding seed shows macro scale.",
         "Photograph something very large (building, tree). First without people. Then include a person for scale. Compare the impact.",
         "No reference for scale makes size ambiguous. Always consider whether viewer can understand size.",
         "Use scale ambiguity deliberately for surreal, disorienting, or abstract effects."
        },
        {"C018", "Colour Harmony",
         "Use colour relationships for mood and cohesion. Monochromatic (one colour, different shades), complementary (opposites), analogous (adjacent), or triadic (three equally spaced) schemes.",
         "Colour creates emotion and unity. Harmonious colours feel intentional and pleasing; clashing colours create energy or discomfort.",
         "When colour is key element, creative work, branding, creating specific mood.",
         "Blue hour city (monochromatic blues) = calm. Autumn forest (analogous oranges, yellows, reds) = warm harmony. Orange sunset with blue shadows (complementary) = vibrant.",
         "Shoot a series in one colour scheme. Monochromatic: find location dominated by one colour. Photograph it emphasizing that colour.",
         "Ignoring colour entirely or including too many competing colours. Be intentional.",
         "Use clashing colours (complementary at high saturation) for vibrant energy or visual discomfort."
        },
        {"C019", "Light and Shadow",
         "Light reveals, shadow conceals. The interplay creates mood, depth, drama, and form. Side light emphasizes texture through shadows. Silhouettes are extreme shadow use.",
         "Photography is literally writing with light. How you use shadow is equally important. High contrast (dramatic), low contrast (soft, calm).",
         "Portraits (side light sculpts face), dramatic scenes, texture emphasis, noir style, silhouettes.",
         "Portrait with window light from side: one side lit, other in shadow (dramatic, dimensional). Silhouette against sunset: shape defined entirely by shadow.",
         "Photograph a person with strong directional light. Position them so half their face is lit, half in shadow. Then create a silhouette by exposing for bright background.",
         "Even, flat lighting with no shadows makes subjects look two-dimensional and boring.",
         "Use flat, even light deliberately for documentary neutrality or beauty/fashion (no harsh shadows)."
        },
        {"C020", "Simplicity and Clutter Control",
         "Remove distractions. Every element should contribute or be removed. Check edges of frame for intrusions. Simplify background. Clear clutter before shooting.",
         "Clutter dilutes your message. Simplicity focuses attention and strengthens impact. Less is more.",
         "All photography. Always ask: does this element add to my image? If no, remove it (change angle, position, crop, or physically move it).",
         "Messy portrait: distracting background objects compete with subject. Clean portrait: simple background directs all attention to subject.",
         "Find a cluttered scene. Photograph it. Then remove/hide distractions and change angle to simplify. Compare results.",
         "Not seeing the clutter - photographer focuses on subject and misses distracting background elements. Review carefully before shooting.",
         "Embrace clutter deliberately to show chaos, authenticity, or complex environments (hoarder documentary, busy market)."
        },
        {"C021", "Horizontal, Vertical, Diagonal Lines",
         "Line orientation affects feeling. Horizontal lines (horizon, resting person): calm, stability, rest. Vertical lines (trees, buildings): strength, growth, height. Diagonal lines: energy, tension, movement.",
         "Lines create subconscious emotional response. They guide composition and mood.",
         "Match line orientation to subject feeling. Calm landscape: emphasize horizontals. Towering building: emphasize verticals. Action scene: diagonals.",
         "Seascape with strong horizontal horizon: calm, peaceful. Forest with vertical trees: strength, upward growth. Diagonal lightning bolt: energy, movement.",
         "Find a scene with strong lines. Photograph emphasizing horizontal lines (calm). Then find diagonal lines (dynamic). Notice emotional difference.",
         "Conflicting line directions creating confusion. Choose dominant orientation and emphasize it.",
         "Mix all line directions equally for visual complexity or chaos."
        },
        {"C022", "Horizon Placement",
         "Don't center the horizon. Place it on upper third (emphasize foreground/water), lower third (emphasize sky), or exclude it entirely.",
         "Centered horizon is static and divides image equally, weakening both halves. Thirds create hierarchy - one element dominates.",
         "Landscapes, seascapes, any scene with visible horizon line.",
         "Dramatic sunset: horizon on lower third emphasizes colorful sky. Textured beach: horizon on upper third emphasizes sand patterns.",
         "Photograph a landscape three times: horizon in center, on upper third, on lower third. Decide which emphasizes your intended subject best.",
         "Automatically centering every horizon by habit. Decide what's important - sky or ground - and emphasize it.",
         "Center horizon deliberately for perfect reflections or when both elements are equally important."
        },
        {"C023", "Subject Separation and Depth of Field",
         "Use shallow depth of field (wide aperture) to blur background and separate subject. Creates three-dimensional feel and focuses attention.",
         "Blur eliminates distractions and makes subject pop from background. Suggests depth in 2D image.",
         "Portraits, wildlife, macro, any time you want clear subject isolation.",
         "Portrait at f/1.8: Face sharp, background creamy blur, subject clearly separated. Flower at f/2.8: Blossom sharp, distracting background blurred away.",
         "Photograph subject against busy background at f/11 (sharp background). Then f/1.8 (blurred background). See how blur isolates subject.",
         "Using narrow aperture (f/16) when separation would help, or not having enough distance between subject and background for blur.",
         "Use deep depth of field (f/11) to include context, show environment, or make subject part of bigger scene."
        },
        {"C024", "Timing and the Decisive Moment",
         "Wait for peak action, perfect expression, elements aligning. Henri Cartier-Bresson's 'decisive moment' - when visual and psychological elements align perfectly.",
         "Split-second timing can make or break image. The difference between good and great is often patience and anticipation.",
         "Street photography, sports, wildlife, candid portraits, any dynamic scene.",
         "Jumping person photographed at exact peak of jump - suspended in air. Street photo where all elements (person, car, light, shadow) align perfectly.",
         "Photograph someone jumping. Shoot continuous burst. Find the frame where they're highest in air with best form. That's the decisive moment.",
         "Shooting too early or late, missing peak action. Anticipate and be ready.",
         "Shoot just before or after peak moment for unusual, off-balance, or transitional effects."
        },
        {"C025", "Frame Within a Frame",
         "Similar to natural framing but more literal - use windows, doorways, mirrors, or other frames within the scene to create layered composition.",
         "Creates depth, focuses attention, adds context, and provides compositional structure.",
         "Architecture, street scenes, portraits through windows, mirrors, creative compositions.",
         "Subject seen through doorway - frame adds depth and context. Reflection in mirror creates second frame within first.",
         "Photograph subject through a literal frame - window, doorway, archway, even hands forming a frame.",
         "Frame too heavy or distracting. Inner frame should enhance, not dominate.",
         "Break the frame - have subject partially outside it for tension or escape feeling."
        },
        {"C026", "Layering and Visual Flow",
         "Arrange elements at different depths with clear visual path between them. Eye travels through layers following visual connections.",
         "Creates journey through image, adds complexity without confusion, suggests narrative.",
         "Landscapes with multiple elements, environmental portraits, travel photography.",
         "Foreground rock, midground lake, background mountains - each layer connects visually, guiding eye deep into scene.",
         "Find scene with multiple depth layers. Arrange your position so layers stack visually and eye flows from nearest to farthest.",
         "Layers that don't connect or guide eye - just random objects at different distances.",
         "Flatten intentionally (telephoto compression) to reduce layers and create abstract, graphic effect."
        },
        {"C027", "Aspect Ratio and Cropping",
         "Aspect ratio (3:2, 4:3, 16:9, 1:1 square, panoramic) affects composition. Crop thoughtfully to strengthen composition, remove distractions, change emphasis.",
         "Different ratios suit different subjects. Square = balanced, intimate. Wide = cinematic, expansive. Vertical = portrait, towering.",
         "Choose ratio based on subject. Portrait: vertical 4:5. Landscape: horizontal 16:9 or panoramic. Social media: square 1:1.",
         "Landscape cropped to panorama emphasizes vastness. Portrait cropped to vertical 4:5 suits social media and emphasizes person.",
         "Take one photo. Crop it to square, wide panoramic, and vertical. See how each ratio changes feeling and emphasis.",
         "Accepting default ratio without considering alternatives, or cropping so tight you lose context.",
         "Use unusual ratios (extreme panorama, very tall vertical) for dramatic effect."
        },
        {"C028", "Visual Weight and Balance",
         "Elements have visual weight based on size, colour, brightness, detail. Balance weight across frame - equal weight for stability, unequal for tension.",
         "Balanced composition feels resolved and complete. Imbalanced creates tension, movement, or discomfort.",
         "All composition. Constantly assess weight distribution and balance against your intent.",
         "Large dark tree (heavy) on left balanced by small bright moon (also heavy despite size) on right. Heavy subject on one third with empty space balancing.",
         "Place heavy object (large, dark, detailed) on one side. Balance with lighter object on other side by adjusting size, brightness, or position.",
         "Accidental imbalance making composition feel like it's tipping. Unless intentional, balance your frame.",
         "Create deliberate imbalance (all weight on one side, empty on other) for discomfort, incompleteness, or dynamic tension."
        }
    };
}

// Quiz Questions Database
vector<QuizQuestion> getQuizQuestions() {
    return {
        {"What does a smaller f-number (like f/1.8) mean?", {"Smaller aperture opening", "Larger aperture opening", "Faster shutter speed", "Higher ISO"}, 1, "A smaller f-number actually means a LARGER aperture opening, allowing more light in. This seems backwards but that's how f-stops work. f/1.8 is a wide aperture."},
        {"Which shutter speed would freeze a running athlete?", {"1/30s", "1/125s", "1/1000s", "2s"}, 2, "1/1000s is fast enough to freeze fast motion like running or sports. Slower speeds like 1/125s might work for slower motion, but 1/1000s is safer for athletes."},
        {"What is the main downside of using high ISO?", {"Less light", "Slower shutter", "Image noise/grain", "Shallow depth of field"}, 2, "High ISO makes images brighter in low light, but introduces noise (grain), reducing image quality. Always use the lowest ISO that gives proper exposure."},
        {"The three elements of the exposure triangle are:", {"Aperture, shutter speed, lens", "Aperture, shutter speed, ISO", "Focus, exposure, white balance", "Aperture, focus, ISO"}, 1, "The exposure triangle consists of aperture, shutter speed, and ISO. These three settings control exposure and must be balanced."},
        {"Which metering mode measures light from a small spot?", {"Matrix", "Center-weighted", "Spot", "Evaluative"}, 2, "Spot metering measures light from a very small area (usually 1-5% of the frame), allowing precise exposure control for specific parts of your scene."},
        {"What does the histogram show?", {"Focus points", "Colour temperature", "Distribution of tones from shadows to highlights", "Aperture range"}, 2, "The histogram displays the distribution of tones in your image, from pure black (left) to pure white (right). It's essential for evaluating exposure."},
        {"For a sharp landscape from foreground to background, use:", {"f/1.8", "f/2.8", "f/5.6", "f/11"}, 3, "f/11 or smaller (f/16, f/22) provides deep depth of field, keeping everything from near to far in focus - ideal for landscapes."},
        {"Which focal length is considered wide-angle?", {"24mm", "50mm", "85mm", "200mm"}, 0, "24mm is wide-angle, capturing an expansive view. Wide-angle lenses are typically 14-35mm. 50mm is standard, 85mm+ is telephoto."},
        {"Golden hour occurs:", {"At noon", "Around sunrise and sunset", "Only in autumn", "During blue hour"}, 1, "Golden hour is the period shortly after sunrise and before sunset when the sun is low, producing warm, soft, directional light ideal for photography."},
        {"The Rule of Thirds suggests:", {"Centering your subject", "Placing subjects on thirds lines or intersections", "Using three subjects", "Taking three photos"}, 1, "The Rule of Thirds divides the frame into a 3x3 grid. Placing subjects on the lines or at intersections creates more dynamic, balanced compositions than centering."}
    };
}

// Calculate exposure value and stops
string calculateExposure(double aperture, double shutterSpeed, int iso, const string& lighting) {
    // Calculate EV (Exposure Value)
    // EV = log2(aperture^2 / shutter_speed * 100 / ISO)
    
    double ev = log2((aperture * aperture) / shutterSpeed * 100.0 / iso);
    
    // Reference exposure: f/5.6, 1/125s, ISO 100 (typical daylight)
    double refAperture = 5.6;
    double refShutter = 1.0 / 125.0;
    int refISO = 100;
    double refEV = log2((refAperture * refAperture) / refShutter * 100.0 / refISO);
    
    double stopsDifference = ev - refEV;
    
    stringstream result;
    result << "{";
    result << "\"aperture\": \"f/" << aperture << "\",";
    result << "\"shutter_speed\": \"1/" << (int)(1.0/shutterSpeed) << "s\",";
    result << "\"iso\": " << iso << ",";
    result << "\"lighting\": \"" << escapeJson(lighting) << "\",";
    result << "\"exposure_value\": " << ev << ",";
    result << "\"stops_from_reference\": " << stopsDifference << ",";
    
    result << "\"explanation\": \"";
    if (stopsDifference > 1) {
        result << "This exposure is " << stopsDifference << " stops brighter than reference. ";
    } else if (stopsDifference < -1) {
        result << "This exposure is " << abs(stopsDifference) << " stops darker than reference. ";
    } else {
        result << "This exposure is close to reference exposure. ";
    }
    
    // Aperture effects
    if (aperture <= 2.8) {
        result << "Wide aperture (f/" << aperture << ") allows lots of light and creates shallow depth of field (blurry background). ";
    } else if (aperture >= 11) {
        result << "Narrow aperture (f/" << aperture << ") allows less light but creates deep depth of field (sharp throughout). ";
    } else {
        result << "Mid-range aperture (f/" << aperture << ") balances light and depth of field. ";
    }
    
    // Shutter speed effects
    if (shutterSpeed < 1.0/500) {
        result << "Fast shutter speed (1/" << (int)(1.0/shutterSpeed) << "s) freezes motion but allows less light. ";
    } else if (shutterSpeed > 1.0/60) {
        result << "Slow shutter speed (1/" << (int)(1.0/shutterSpeed) << "s) allows more light but may show motion blur. Use a tripod. ";
    } else {
        result << "Moderate shutter speed (1/" << (int)(1.0/shutterSpeed) << "s) balances motion freezing and light. ";
    }
    
    // ISO effects
    if (iso <= 400) {
        result << "Low ISO (" << iso << ") produces clean images with minimal noise. ";
    } else if (iso >= 1600) {
        result << "High ISO (" << iso << ") brightens the image but adds noise/grain. ";
    } else {
        result << "Moderate ISO (" << iso << ") balances brightness and image quality. ";
    }
    
    result << "\",";
    result << "\"warning\": \"";
    
    // Warnings
    if (shutterSpeed > 1.0/60 && lighting.find("hand") != string::npos) {
        result << "Shutter speed may be too slow for handheld - risk of camera shake. ";
    }
    if (iso > 3200) {
        result << "Very high ISO will produce noticeable noise. ";
    }
    if (aperture < 1.8) {
        result << "Extremely wide aperture - depth of field will be razor-thin. ";
    }
    
    result << "\"";
    result << "}";
    
    return result.str();
}

// Camera settings advisor
string adviseCameraSettings(const string& subject, const string& lighting, const string& effect) {
    stringstream result;
    result << "{";
    result << "\"subject\": \"" << escapeJson(subject) << "\",";
    result << "\"lighting\": \"" << escapeJson(lighting) << "\",";
    result << "\"effect\": \"" << escapeJson(effect) << "\",";
    
    // Default settings
    string aperture = "f/5.6";
    string shutter = "1/125s";
    string iso = "400";
    string explanation = "";
    string tips = "";
    
    // Determine settings based on inputs
    if (subject == "portrait") {
        if (effect == "background_blur") {
            aperture = "f/1.8 - f/2.8";
            shutter = "1/125s - 1/250s";
            explanation = "Wide aperture creates beautiful background blur (bokeh), isolating your subject. Use a longer lens (50-85mm) for flattering perspective.";
            tips = "Focus on the nearest eye. Use single-point autofocus. Position subject away from background for more blur.";
        } else {
            aperture = "f/4 - f/5.6";
            shutter = "1/125s - 1/250s";
            explanation = "Moderate aperture keeps face sharp while slightly softening background. Good for environmental portraits.";
            tips = "Watch for distracting background elements. Use natural window light when possible.";
        }
        
        if (lighting == "bright") {
            iso = "100 - 200";
        } else if (lighting == "low_light" || lighting == "night") {
            iso = "800 - 3200";
            tips += " Consider using flash or LED light in very dark conditions.";
        } else {
            iso = "400 - 800";
        }
    } else if (subject == "landscape") {
        aperture = "f/8 - f/16";
        shutter = "1/60s - 1/250s (tripod: 1s - 30s)";
        explanation = "Narrow aperture ensures sharpness from foreground to background. Use tripod for sharp images at slower speeds.";
        tips = "Shoot during golden hour (sunrise/sunset) for best light. Include foreground interest. Use rule of thirds for horizon.";
        
        if (lighting == "bright") {
            iso = "100";
        } else if (lighting == "low_light") {
            iso = "400 - 800";
            tips += " Golden hour is perfect for landscapes - not too bright, beautiful directional light.";
        } else {
            iso = "100 - 400";
        }
    } else if (subject == "sports" || subject == "action") {
        aperture = "f/2.8 - f/5.6";
        shutter = "1/500s - 1/2000s";
        explanation = "Fast shutter speed freezes motion. Wide aperture allows faster shutter in available light. Use continuous autofocus.";
        tips = "Track subject with your camera. Shoot in burst mode. Anticipate action. Use shutter priority mode if not using manual.";
        
        if (lighting == "bright") {
            iso = "400 - 800";
        } else if (lighting == "low_light" || lighting == "indoor") {
            iso = "1600 - 6400";
            tips += " Indoor sports need high ISO. Accept some noise to maintain fast shutter speed.";
        } else {
            iso = "800 - 1600";
        }
    } else if (subject == "macro") {
        aperture = "f/8 - f/16";
        shutter = "1/125s - 1/250s (or use flash)";
        explanation = "In macro photography, depth of field is extremely shallow. Use smaller aperture for adequate sharpness. Tripod highly recommended.";
        tips = "Use manual focus for precision. Even slight breeze moves subject. Use flash or LED for extra light. Focus on eyes in insects.";
        iso = "400 - 800";
    } else if (subject == "street") {
        aperture = "f/5.6 - f/8";
        shutter = "1/125s - 1/500s";
        explanation = "Moderate aperture provides good depth of field to keep subjects in focus while separating from background. Fast enough shutter for candid moments.";
        tips = "Use zone focusing or continuous AF. Be discreet and respectful. Look for interesting light and decisive moments.";
        
        if (lighting == "bright") {
            iso = "200 - 400";
        } else if (lighting == "low_light" || lighting == "night") {
            iso = "1600 - 6400";
            tips += " Night street photography is challenging. Find light sources (streetlights, signs). Embrace shadows.";
        } else {
            iso = "400 - 1600";
        }
    } else if (subject == "night") {
        aperture = "f/2.8 - f/8 (stars: f/2.8, cityscapes: f/8)";
        shutter = "5s - 30s (stars: 15-25s, city: variable)";
        explanation = "Night photography requires long exposures. Tripod is essential. Wide aperture for stars (avoid trails). Smaller aperture for city lights (creates starbursts).";
        tips = "Use manual focus (autofocus struggles in dark). Use 2-second timer or remote to avoid shake. For stars, use '500 rule': 500/focal length = max shutter to avoid trails.";
        iso = "1600 - 6400";
    } else {
        // Default everyday photography
        aperture = "f/4 - f/8";
        shutter = "1/125s - 1/250s";
        explanation = "Versatile settings for general photography. Adjust based on specific lighting and motion.";
        tips = "These are starting points. Review your images and adjust. Watch your shutter speed in low light to avoid blur.";
        
        if (lighting == "bright") {
            iso = "100 - 400";
        } else if (lighting == "low_light") {
            iso = "800 - 1600";
        } else {
            iso = "400 - 800";
        }
    }
    
    result << "\"recommended_aperture\": \"" << escapeJson(aperture) << "\",";
    result << "\"recommended_shutter\": \"" << escapeJson(shutter) << "\",";
    result << "\"recommended_iso\": \"" << escapeJson(iso) << "\",";
    result << "\"explanation\": \"" << escapeJson(explanation) << "\",";
    result << "\"tips\": \"" << escapeJson(tips) << "\"";
    result << "}";
    
    return result.str();
}

// Main command handler
int main(int argc, char* argv[]) {
    if (argc < 2) {
        cerr << "Usage: photomentor_engine <command> [args...]" << endl;
        return 1;
    }
    
    string command = argv[1];
    
    try {
        if (command == "get_lessons") {
            vector<Lesson> lessons = getLessons();
            cout << "{\"lessons\": [";
            for (size_t i = 0; i < lessons.size(); i++) {
                cout << "{";
                cout << "\"id\": \"" << lessons[i].id << "\",";
                cout << "\"title\": \"" << escapeJson(lessons[i].title) << "\",";
                cout << "\"category\": \"" << escapeJson(lessons[i].category) << "\",";
                cout << "\"content\": \"" << escapeJson(lessons[i].content) << "\",";
                cout << "\"examples\": \"" << escapeJson(lessons[i].examples) << "\",";
                cout << "\"exercises\": \"" << escapeJson(lessons[i].exercises) << "\"";
                cout << "}";
                if (i < lessons.size() - 1) cout << ",";
            }
            cout << "]}" << endl;
            
        } else if (command == "get_composition") {
            vector<CompositionPrinciple> principles = getCompositionPrinciples();
            cout << "{\"principles\": [";
            for (size_t i = 0; i < principles.size(); i++) {
                cout << "{";
                cout << "\"id\": \"" << principles[i].id << "\",";
                cout << "\"title\": \"" << escapeJson(principles[i].title) << "\",";
                cout << "\"definition\": \"" << escapeJson(principles[i].definition) << "\",";
                cout << "\"why_it_works\": \"" << escapeJson(principles[i].why_it_works) << "\",";
                cout << "\"when_to_use\": \"" << escapeJson(principles[i].when_to_use) << "\",";
                cout << "\"example\": \"" << escapeJson(principles[i].example) << "\",";
                cout << "\"exercise\": \"" << escapeJson(principles[i].exercise) << "\",";
                cout << "\"common_mistakes\": \"" << escapeJson(principles[i].common_mistakes) << "\",";
                cout << "\"breaking_rule\": \"" << escapeJson(principles[i].breaking_rule) << "\"";
                cout << "}";
                if (i < principles.size() - 1) cout << ",";
            }
            cout << "]}" << endl;
            
        } else if (command == "get_quiz") {
            vector<QuizQuestion> questions = getQuizQuestions();
            cout << "{\"questions\": [";
            for (size_t i = 0; i < questions.size(); i++) {
                cout << "{";
                cout << "\"question\": \"" << escapeJson(questions[i].question) << "\",";
                cout << "\"options\": [";
                for (size_t j = 0; j < questions[i].options.size(); j++) {
                    cout << "\"" << escapeJson(questions[i].options[j]) << "\"";
                    if (j < questions[i].options.size() - 1) cout << ",";
                }
                cout << "],";
                cout << "\"correct_answer\": " << questions[i].correct_answer << ",";
                cout << "\"explanation\": \"" << escapeJson(questions[i].explanation) << "\"";
                cout << "}";
                if (i < questions.size() - 1) cout << ",";
            }
            cout << "]}" << endl;
            
        } else if (command == "grade_quiz" && argc >= 3) {
            string answersJson = argv[2];
            vector<QuizQuestion> questions = getQuizQuestions();
            
            // Simple answer parsing (expects comma-separated indices)
            vector<int> userAnswers;
            stringstream ss(answersJson);
            string item;
            while (getline(ss, item, ',')) {
                userAnswers.push_back(stoi(item));
            }
            
            int score = 0;
            for (size_t i = 0; i < userAnswers.size() && i < questions.size(); i++) {
                if (userAnswers[i] == questions[i].correct_answer) {
                    score++;
                }
            }
            
            int total = min(userAnswers.size(), questions.size());
            double percentage = (total > 0) ? (score * 100.0 / total) : 0;
            
            cout << "{";
            cout << "\"score\": " << score << ",";
            cout << "\"total\": " << total << ",";
            cout << "\"percentage\": " << percentage;
            cout << "}" << endl;
            
        } else if (command == "calculate_exposure" && argc >= 5) {
            double aperture = stod(argv[2]);
            double shutterSpeed = stod(argv[3]);
            int iso = stoi(argv[4]);
            string lighting = (argc >= 6) ? argv[5] : "moderate";
            
            cout << calculateExposure(aperture, shutterSpeed, iso, lighting) << endl;
            
        } else if (command == "advise_settings" && argc >= 4) {
            string subject = argv[2];
            string lighting = argv[3];
            string effect = (argc >= 5) ? argv[4] : "balanced";
            
            cout << adviseCameraSettings(subject, lighting, effect) << endl;
            
        } else {
            cerr << "Unknown command: " << command << endl;
            return 1;
        }
        
    } catch (const exception& e) {
        cerr << "Error: " << e.what() << endl;
        return 1;
    }
    
    return 0;
}
