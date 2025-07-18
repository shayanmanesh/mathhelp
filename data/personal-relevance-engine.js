// Personal Relevance Engine - AI-Powered Mathematical Customization
// Phase 11 Implementation for MathVerse

class PersonalRelevanceEngine {
    constructor() {
        this.userProfile = this.loadUserProfile();
        this.interestCategories = this.initializeInterestCategories();
        this.exampleDatabase = this.initializeExampleDatabase();
        this.analogyDatabase = this.initializeAnalogyDatabase();
    }

    // User Profile Management
    loadUserProfile() {
        const defaultProfile = {
            interests: [],
            learningStyle: 'visual',
            currentLevel: 5,
            goals: ['understanding'],
            timeAvailable: 30, // minutes per day
            strugglingWith: [],
            completedConcepts: [],
            preferredApplications: [],
            culturalContext: 'general',
            ageGroup: 'teen',
            careerGoals: []
        };

        const stored = localStorage.getItem('mathverse-user-profile');
        return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
    }

    saveUserProfile() {
        localStorage.setItem('mathverse-user-profile', JSON.stringify(this.userProfile));
    }

    updateUserProfile(updates) {
        this.userProfile = { ...this.userProfile, ...updates };
        this.saveUserProfile();
    }

    // Interest Categories & Applications
    initializeInterestCategories() {
        return {
            music: {
                applications: ['sound_waves', 'harmony', 'rhythm', 'audio_processing', 'acoustics'],
                keywords: ['frequency', 'amplitude', 'wavelength', 'resonance', 'pitch'],
                examples: ['fourier_analysis_music', 'logarithmic_scales_decibels', 'wave_interference']
            },
            sports: {
                applications: ['trajectory', 'statistics', 'optimization', 'physics', 'probability'],
                keywords: ['velocity', 'acceleration', 'angles', 'statistics', 'performance'],
                examples: ['projectile_motion_basketball', 'batting_averages', 'game_theory_strategy']
            },
            gaming: {
                applications: ['graphics', 'physics_engines', 'algorithms', 'probability', 'ai'],
                keywords: ['vectors', 'matrices', 'collision_detection', 'randomness', 'pathfinding'],
                examples: ['3d_transformations', 'procedural_generation', 'neural_networks_ai']
            },
            art: {
                applications: ['perspective', 'symmetry', 'fractals', 'color_theory', 'digital_art'],
                keywords: ['geometry', 'proportion', 'golden_ratio', 'tessellation', 'transformation'],
                examples: ['perspective_drawing', 'mandelbrot_set', 'color_mixing_rgb']
            },
            technology: {
                applications: ['algorithms', 'cryptography', 'data_science', 'machine_learning', 'networking'],
                keywords: ['efficiency', 'security', 'patterns', 'optimization', 'compression'],
                examples: ['search_algorithms', 'rsa_encryption', 'neural_networks']
            },
            nature: {
                applications: ['growth_patterns', 'population_dynamics', 'fractals', 'optimization', 'modeling'],
                keywords: ['fibonacci', 'exponential_growth', 'cycles', 'equilibrium', 'patterns'],
                examples: ['fibonacci_flowers', 'predator_prey_models', 'branching_patterns']
            },
            economics: {
                applications: ['compound_interest', 'optimization', 'probability', 'statistics', 'modeling'],
                keywords: ['growth', 'risk', 'profit', 'investment', 'market'],
                examples: ['compound_interest', 'supply_demand_curves', 'game_theory_markets']
            },
            science: {
                applications: ['physics', 'chemistry', 'biology', 'astronomy', 'engineering'],
                keywords: ['measurement', 'modeling', 'analysis', 'prediction', 'experimentation'],
                examples: ['planetary_motion', 'chemical_reactions', 'dna_structure']
            }
        };
    }

    // Example Database with Context-Specific Applications
    initializeExampleDatabase() {
        return {
            // Pythagorean Theorem Examples
            pythagorean_theorem: {
                music: {
                    title: "Guitar String Harmonics",
                    description: "When you press a guitar string at the 12th fret, you create a right triangle. The string length, fret distance, and harmonic create perfect mathematical relationships.",
                    visualization: "guitar_fret_triangle",
                    realWorld: "Understanding why the 12th fret produces an octave higher note"
                },
                sports: {
                    title: "Baseball Diamond Distances",
                    description: "A baseball diamond is a perfect square. The distance from home plate to second base forms the hypotenuse of a right triangle.",
                    calculation: "90² + 90² = distance²",
                    realWorld: "Calculating the shortest path for a throw from first to third base"
                },
                gaming: {
                    title: "Character Movement Distance",
                    description: "In 2D games, when a character moves diagonally, the Pythagorean theorem calculates the actual distance traveled.",
                    code: "distance = Math.sqrt(deltaX² + deltaY²)",
                    realWorld: "Ensuring consistent movement speed in all directions"
                },
                art: {
                    title: "Canvas Diagonal Measurements",
                    description: "Artists use the Pythagorean theorem to calculate diagonal lines for perspective and proportion in their artwork.",
                    application: "Creating accurate perspective drawings",
                    realWorld: "Ensuring proper proportions in architectural sketches"
                }
            },

            // Quadratic Functions Examples
            quadratic_functions: {
                sports: {
                    title: "Basketball Shot Trajectory",
                    description: "The path of a basketball follows a parabola. The quadratic function describes the ball's height over time.",
                    equation: "h(t) = -16t² + v₀t + h₀",
                    realWorld: "Calculating optimal shooting angles and release speeds"
                },
                technology: {
                    title: "Satellite Dish Design",
                    description: "Parabolic satellite dishes focus signals at a single point using quadratic curve properties.",
                    application: "Maximizing signal reception efficiency",
                    realWorld: "Designing antennas for optimal communication"
                },
                economics: {
                    title: "Profit Maximization",
                    description: "Business profit often follows a quadratic curve - too little or too much production reduces profit.",
                    equation: "P(x) = -ax² + bx - c",
                    realWorld: "Finding the optimal production level for maximum profit"
                }
            },

            // Exponential Functions Examples
            exponential_functions: {
                music: {
                    title: "Musical Note Frequencies",
                    description: "Each octave doubles the frequency - an exponential relationship that creates musical harmony.",
                    pattern: "f(n) = 440 × 2^(n/12)",
                    realWorld: "Understanding why musical intervals sound pleasing"
                },
                technology: {
                    title: "Computer Processing Power",
                    description: "Moore's Law describes the exponential growth of computer processing power over time.",
                    application: "Predicting future computing capabilities",
                    realWorld: "Planning technology upgrades and development cycles"
                },
                nature: {
                    title: "Bacterial Growth",
                    description: "Bacteria populations grow exponentially under ideal conditions, doubling at regular intervals.",
                    equation: "N(t) = N₀ × 2^(t/d)",
                    realWorld: "Understanding infection spread and antibiotic timing"
                }
            },

            // Probability Examples
            probability: {
                gaming: {
                    title: "Loot Box Mechanics",
                    description: "Video games use probability to determine rare item drops and create engaging gameplay.",
                    calculation: "P(rare item) = 1/100 = 1%",
                    realWorld: "Understanding game mechanics and expected outcomes"
                },
                sports: {
                    title: "Fantasy Sports Predictions",
                    description: "Fantasy sports rely on probability to predict player performance and game outcomes.",
                    application: "Calculating expected fantasy points",
                    realWorld: "Making informed decisions in fantasy leagues"
                },
                economics: {
                    title: "Investment Risk Assessment",
                    description: "Financial markets use probability to assess investment risks and potential returns.",
                    concept: "Risk vs. reward calculations",
                    realWorld: "Making informed investment decisions"
                }
            },

            // Trigonometry Examples
            trigonometry: {
                music: {
                    title: "Sound Wave Analysis",
                    description: "Sound waves are trigonometric functions. Sine and cosine describe how air pressure varies over time.",
                    equation: "y = A sin(2πft + φ)",
                    realWorld: "Creating synthesizers and audio effects"
                },
                art: {
                    title: "Perspective Drawing",
                    description: "Artists use trigonometry to calculate proper angles and proportions in perspective drawings.",
                    application: "Creating realistic 3D effects on 2D surfaces",
                    realWorld: "Architectural and technical drawing accuracy"
                },
                technology: {
                    title: "GPS Navigation",
                    description: "GPS systems use trigonometry to triangulate your position from satellite signals.",
                    process: "Measuring angles and distances from multiple satellites",
                    realWorld: "Accurate location services on your phone"
                }
            }
        };
    }

    // Analogy Database for Different Contexts
    initializeAnalogyDatabase() {
        return {
            functions: {
                general: "A function is like a machine that takes inputs and produces outputs",
                cooking: "A function is like a recipe - you put in ingredients (inputs) and get a dish (output)",
                technology: "A function is like an app - you input data and get processed results",
                music: "A function is like a musical instrument - you input finger positions and get sound output"
            },
            derivatives: {
                general: "Derivatives measure how fast something is changing",
                sports: "Derivatives are like measuring how quickly a runner's speed changes during a race",
                driving: "Derivatives are like your speedometer vs. how hard you press the gas pedal",
                economics: "Derivatives show how quickly profit changes as you produce more items"
            },
            limits: {
                general: "Limits describe what happens as you get infinitely close to something",
                photography: "Limits are like zooming in on a photo - you can get arbitrarily close to see detail",
                sports: "Limits are like approaching the finish line - you get closer and closer but there's always a final moment",
                technology: "Limits are like internet speed - theoretical maximum vs. what you actually get"
            },
            matrices: {
                general: "Matrices are organized grids of numbers that transform data",
                gaming: "Matrices are like character stats sheets that determine abilities and transformations",
                art: "Matrices are like color filters that transform how images appear",
                music: "Matrices are like mixing boards that combine and transform multiple audio channels"
            }
        };
    }

    // Generate Customized Examples
    generateCustomExample(conceptId, userInterests = null) {
        const interests = userInterests || this.userProfile.interests;
        const examples = this.exampleDatabase[conceptId];
        
        if (!examples) {
            return this.generateGenericExample(conceptId);
        }

        // Find best matching interest
        for (const interest of interests) {
            if (examples[interest]) {
                return {
                    ...examples[interest],
                    type: 'personalized',
                    matchedInterest: interest,
                    conceptId: conceptId
                };
            }
        }

        // Fallback to most popular or first available
        const availableInterests = Object.keys(examples);
        const fallbackInterest = availableInterests[0];
        
        return {
            ...examples[fallbackInterest],
            type: 'generic',
            matchedInterest: fallbackInterest,
            conceptId: conceptId
        };
    }

    // Generate Contextual Analogies
    generateAnalogy(conceptId, context = null) {
        const userContext = context || this.inferUserContext();
        const analogies = this.analogyDatabase[conceptId];
        
        if (!analogies) {
            return "This concept can be understood through step-by-step exploration.";
        }

        return analogies[userContext] || analogies.general || "Explore this concept through interactive examples.";
    }

    // Infer User Context from Profile
    inferUserContext() {
        const interests = this.userProfile.interests;
        
        if (interests.includes('technology') || interests.includes('gaming')) return 'technology';
        if (interests.includes('sports')) return 'sports';
        if (interests.includes('music') || interests.includes('art')) return 'art';
        if (interests.includes('cooking') || interests.includes('nature')) return 'cooking';
        
        return 'general';
    }

    // Real-world Application Suggestions
    generateApplicationSuggestions(conceptId) {
        const userInterests = this.userProfile.interests;
        const suggestions = [];

        for (const interest of userInterests) {
            const category = this.interestCategories[interest];
            if (category && category.applications.some(app => this.isRelevantTo(conceptId, app))) {
                suggestions.push({
                    interest: interest,
                    applications: category.applications.filter(app => this.isRelevantTo(conceptId, app)),
                    description: this.getApplicationDescription(conceptId, interest)
                });
            }
        }

        return suggestions;
    }

    // Check if concept is relevant to application
    isRelevantTo(conceptId, application) {
        const relevanceMap = {
            pythagorean_theorem: ['graphics', 'physics', 'measurement', 'navigation'],
            quadratic_functions: ['trajectory', 'optimization', 'physics', 'economics'],
            exponential_functions: ['growth', 'decay', 'compound_interest', 'population'],
            trigonometry: ['waves', 'rotation', 'periodic', 'navigation'],
            probability: ['statistics', 'prediction', 'risk', 'gaming'],
            calculus: ['optimization', 'physics', 'engineering', 'analysis']
        };

        return relevanceMap[conceptId]?.includes(application) || false;
    }

    // Get Application Description
    getApplicationDescription(conceptId, interest) {
        const descriptions = {
            pythagorean_theorem: {
                gaming: "Essential for 2D/3D game physics, collision detection, and character movement",
                sports: "Calculating distances, trajectories, and optimal angles in various sports",
                technology: "Used in GPS systems, computer graphics, and engineering calculations"
            },
            quadratic_functions: {
                sports: "Modeling projectile motion in basketball, football, and other trajectory sports",
                economics: "Optimizing profit, cost analysis, and market equilibrium calculations",
                technology: "Antenna design, signal processing, and optimization algorithms"
            }
        };

        return descriptions[conceptId]?.[interest] || "Practical applications in real-world scenarios";
    }

    // Difficulty Adaptation
    adaptDifficultyLevel(conceptId, currentLevel) {
        const userLevel = this.userProfile.currentLevel;
        const strugglingAreas = this.userProfile.strugglingWith;
        
        let recommendedLevel = userLevel;

        // Adjust based on struggling areas
        if (strugglingAreas.includes('word_problems') && this.isWordProblemHeavy(conceptId)) {
            recommendedLevel = Math.max(1, recommendedLevel - 1);
        }
        
        if (strugglingAreas.includes('abstract_thinking') && this.isAbstract(conceptId)) {
            recommendedLevel = Math.max(1, recommendedLevel - 1);
        }

        return Math.min(10, Math.max(1, recommendedLevel));
    }

    // Learning Style Adaptation
    adaptToLearningStyle(content, style = null) {
        const learningStyle = style || this.userProfile.learningStyle;

        switch (learningStyle) {
            case 'visual':
                return {
                    ...content,
                    emphasis: 'visualizations',
                    preferredElements: ['graphs', 'diagrams', 'animations', 'color_coding'],
                    reducedElements: ['text_heavy_explanations']
                };
            
            case 'auditory':
                return {
                    ...content,
                    emphasis: 'explanations',
                    preferredElements: ['step_by_step_narration', 'rhythm_patterns', 'analogies'],
                    reducedElements: ['silent_reading']
                };
            
            case 'kinesthetic':
                return {
                    ...content,
                    emphasis: 'interaction',
                    preferredElements: ['hands_on_activities', 'manipulation', 'real_world_building'],
                    reducedElements: ['passive_observation']
                };
            
            default:
                return content;
        }
    }

    // Progress Tracking & Recommendations
    trackProgress(conceptId, understanding_level, time_spent) {
        const progress = {
            conceptId,
            understanding_level,
            time_spent,
            timestamp: Date.now(),
            attempts: 1
        };

        // Update user profile
        if (!this.userProfile.progress) {
            this.userProfile.progress = {};
        }

        if (this.userProfile.progress[conceptId]) {
            this.userProfile.progress[conceptId].attempts += 1;
            this.userProfile.progress[conceptId].latest_understanding = understanding_level;
        } else {
            this.userProfile.progress[conceptId] = progress;
        }

        this.saveUserProfile();
        return this.generateNextRecommendations(conceptId, understanding_level);
    }

    // Generate Next Concept Recommendations
    generateNextRecommendations(currentConceptId, understandingLevel) {
        const recommendations = [];

        if (understandingLevel >= 7) {
            // Strong understanding - suggest advanced or related concepts
            recommendations.push({
                type: 'advancement',
                concepts: this.getAdvancedConcepts(currentConceptId),
                reason: 'Ready for more advanced topics'
            });
        } else if (understandingLevel >= 5) {
            // Decent understanding - suggest applications
            recommendations.push({
                type: 'application',
                concepts: this.getApplicationConcepts(currentConceptId),
                reason: 'Practice with real-world applications'
            });
        } else {
            // Needs reinforcement - suggest prerequisites or different approach
            recommendations.push({
                type: 'reinforcement',
                concepts: this.getPrerequisiteConcepts(currentConceptId),
                reason: 'Strengthen foundational understanding'
            });
        }

        return recommendations;
    }

    // Helper Methods
    isWordProblemHeavy(conceptId) {
        const wordProblemConcepts = ['percentage', 'ratios', 'word_problems', 'applications'];
        return wordProblemConcepts.includes(conceptId);
    }

    isAbstract(conceptId) {
        const abstractConcepts = ['abstract_algebra', 'topology', 'analysis', 'logic'];
        return abstractConcepts.includes(conceptId);
    }

    getAdvancedConcepts(conceptId) {
        // Implementation would return more advanced related concepts
        return ['advanced_' + conceptId, conceptId + '_applications'];
    }

    getApplicationConcepts(conceptId) {
        // Implementation would return practical application concepts
        return [conceptId + '_real_world', conceptId + '_projects'];
    }

    getPrerequisiteConcepts(conceptId) {
        // Implementation would return foundational concepts
        return ['basic_' + conceptId, conceptId + '_foundations'];
    }

    // Public API Methods
    getPersonalizedContent(conceptId, options = {}) {
        const example = this.generateCustomExample(conceptId, options.interests);
        const analogy = this.generateAnalogy(conceptId, options.context);
        const applications = this.generateApplicationSuggestions(conceptId);
        const adaptedLevel = this.adaptDifficultyLevel(conceptId, options.currentLevel);
        
        return {
            personalizedExample: example,
            contextualAnalogy: analogy,
            relevantApplications: applications,
            recommendedLevel: adaptedLevel,
            learningStyleAdaptations: this.adaptToLearningStyle({}, options.learningStyle)
        };
    }

    setupUserProfile(interests, learningStyle, currentLevel, goals) {
        this.updateUserProfile({
            interests,
            learningStyle,
            currentLevel,
            goals,
            setupComplete: true,
            setupDate: Date.now()
        });

        return this.userProfile;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersonalRelevanceEngine;
} else {
    window.PersonalRelevanceEngine = PersonalRelevanceEngine;
}