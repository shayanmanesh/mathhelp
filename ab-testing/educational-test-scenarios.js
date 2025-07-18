// Educational A/B Test Scenarios and Templates
// Pre-configured experiments for common educational optimization goals

class EducationalTestScenarios {
  constructor() {
    this.scenarios = this.defineScenarios();
    this.templates = this.defineTemplates();
    this.bestPractices = this.defineBestPractices();
  }

  // ============================================
  // PREDEFINED TEST SCENARIOS
  // ============================================

  defineScenarios() {
    return {
      // ----------------------------------------
      // SIGNUP & ONBOARDING OPTIMIZATION
      // ----------------------------------------
      
      signup_flow: {
        name: 'Signup Flow Optimization',
        category: 'conversion',
        description: 'Test different signup flows to increase registration rates',
        expectedImprovement: '15-25%',
        experiments: [
          {
            id: 'signup_friction_reduction',
            name: 'Reduce Signup Friction',
            hypothesis: 'Reducing form fields and offering social login will increase signups',
            variants: [
              {
                id: 'control',
                name: 'Traditional Form',
                description: 'Email, password, name, grade level',
                implementation: {
                  formFields: ['email', 'password', 'name', 'grade'],
                  socialLogin: false,
                  guestOption: false
                }
              },
              {
                id: 'minimal',
                name: 'Minimal Form',
                description: 'Just email and password',
                implementation: {
                  formFields: ['email', 'password'],
                  socialLogin: false,
                  guestOption: false,
                  delayedProfile: true
                }
              },
              {
                id: 'social',
                name: 'Social Login Priority',
                description: 'Google/Facebook login prominent',
                implementation: {
                  formFields: ['email', 'password'],
                  socialLogin: true,
                  socialProviders: ['google', 'facebook', 'apple'],
                  guestOption: false
                }
              },
              {
                id: 'guest_first',
                name: 'Guest Mode First',
                description: 'Try before signup',
                implementation: {
                  guestOption: true,
                  guestLimit: 5, // problems before signup required
                  conversionPrompt: 'progressive'
                }
              }
            ],
            metrics: ['signup_rate', 'signup_completion_time', 'form_abandonment'],
            duration: 14,
            sampleSize: 2000
          },
          
          {
            id: 'value_proposition_test',
            name: 'Landing Page Value Props',
            hypothesis: 'Emphasizing learning outcomes over features increases conversions',
            variants: [
              {
                id: 'control',
                name: 'Feature-Focused',
                description: 'List of platform features',
                implementation: {
                  headline: 'Complete Math Learning Platform',
                  subheadline: '500+ lessons, step-by-step solutions, progress tracking',
                  cta: 'Start Learning'
                }
              },
              {
                id: 'outcome_focused',
                name: 'Outcome-Focused',
                description: 'Student success stories',
                implementation: {
                  headline: 'Improve Your Math Grade by 1 Letter Grade',
                  subheadline: '87% of students see improvement in 30 days',
                  cta: 'Get Better Grades',
                  socialProof: true
                }
              },
              {
                id: 'parent_focused',
                name: 'Parent-Targeted',
                description: 'Peace of mind for parents',
                implementation: {
                  headline: 'Help Your Child Excel in Math',
                  subheadline: 'Track progress, identify gaps, celebrate success',
                  cta: 'Help My Child',
                  parentTestimonials: true
                }
              }
            ],
            metrics: ['signup_rate', 'bounce_rate', 'time_to_signup'],
            clustering: 'individual',
            duration: 21
          }
        ]
      },

      // ----------------------------------------
      // DEMO REQUEST OPTIMIZATION
      // ----------------------------------------
      
      demo_optimization: {
        name: 'Demo Request Optimization',
        category: 'conversion',
        description: 'Increase demo requests from educators and schools',
        expectedImprovement: '30-50%',
        experiments: [
          {
            id: 'demo_cta_placement',
            name: 'Demo CTA Placement',
            hypothesis: 'Contextual demo CTAs will outperform generic placement',
            variants: [
              {
                id: 'control',
                name: 'Header Only',
                description: 'Demo button in main navigation',
                implementation: {
                  positions: ['header'],
                  style: 'button',
                  text: 'Request Demo'
                }
              },
              {
                id: 'contextual',
                name: 'Contextual CTAs',
                description: 'Demo CTAs near relevant content',
                implementation: {
                  positions: ['header', 'teacher_features', 'pricing', 'footer'],
                  style: 'contextual',
                  text: {
                    teacher_features: 'See How It Works in Your Classroom',
                    pricing: 'Get Custom School Pricing',
                    default: 'Request Demo'
                  }
                }
              },
              {
                id: 'floating',
                name: 'Floating Assistant',
                description: 'Persistent chat-style CTA',
                implementation: {
                  style: 'floating_chat',
                  text: 'Questions? Let\'s talk!',
                  behavior: 'appear_after_scroll',
                  triggerPoint: '30%'
                }
              }
            ],
            metrics: ['demo_request_rate', 'cta_click_rate', 'qualified_lead_rate'],
            audience: 'educators',
            duration: 14
          },
          
          {
            id: 'demo_form_optimization',
            name: 'Demo Form Optimization',
            hypothesis: 'Progressive forms increase completion rates',
            variants: [
              {
                id: 'control',
                name: 'Single Long Form',
                description: 'All fields on one page',
                implementation: {
                  fields: ['name', 'email', 'phone', 'school', 'role', 'students', 'needs'],
                  steps: 1,
                  validation: 'on_submit'
                }
              },
              {
                id: 'multi_step',
                name: 'Multi-Step Form',
                description: 'Broken into logical steps',
                implementation: {
                  steps: 3,
                  step1: ['name', 'email'],
                  step2: ['school', 'role'],
                  step3: ['students', 'needs'],
                  progressBar: true,
                  validation: 'per_step'
                }
              },
              {
                id: 'conversational',
                name: 'Conversational Form',
                description: 'Chat-like interface',
                implementation: {
                  style: 'conversational',
                  questions: [
                    'Hi! What\'s your name?',
                    'Great! What\'s your email?',
                    'Which school are you from?',
                    'How many students do you teach?'
                  ],
                  skipLogic: true
                }
              }
            ],
            metrics: ['form_completion_rate', 'field_drop_off', 'time_to_complete'],
            duration: 21
          }
        ]
      },

      // ----------------------------------------
      // USER RETENTION & ENGAGEMENT
      // ----------------------------------------
      
      retention_optimization: {
        name: 'User Retention Optimization',
        category: 'engagement',
        description: 'Improve user retention and return rates',
        expectedImprovement: '20-40%',
        experiments: [
          {
            id: 'onboarding_experience',
            name: 'Onboarding Experience',
            hypothesis: 'Personalized onboarding increases 7-day retention',
            variants: [
              {
                id: 'control',
                name: 'Standard Welcome',
                description: 'Generic welcome flow',
                implementation: {
                  steps: ['welcome_message', 'feature_tour', 'first_problem'],
                  personalization: false,
                  duration: '5min'
                }
              },
              {
                id: 'personalized',
                name: 'Personalized Path',
                description: 'Based on skill assessment',
                implementation: {
                  steps: ['welcome', 'skill_assessment', 'personalized_recommendation', 'first_problem'],
                  personalization: true,
                  adaptiveDifficulty: true,
                  duration: '8min'
                }
              },
              {
                id: 'goal_oriented',
                name: 'Goal-Setting Flow',
                description: 'Student sets learning goals',
                implementation: {
                  steps: ['welcome', 'goal_setting', 'commitment_device', 'first_milestone'],
                  goals: ['improve_grade', 'exam_prep', 'skill_building'],
                  reminders: true,
                  duration: '7min'
                }
              },
              {
                id: 'social',
                name: 'Social Onboarding',
                description: 'Connect with classmates',
                implementation: {
                  steps: ['welcome', 'find_classmates', 'join_study_group', 'first_challenge'],
                  socialFeatures: true,
                  competitiveElements: true,
                  duration: '6min'
                }
              }
            ],
            metrics: ['7_day_retention', 'problems_solved_week1', 'sessions_week1'],
            clustering: 'individual',
            duration: 28
          },
          
          {
            id: 'engagement_mechanics',
            name: 'Engagement Mechanics Test',
            hypothesis: 'Gamification elements increase daily active usage',
            variants: [
              {
                id: 'control',
                name: 'No Gamification',
                description: 'Pure learning experience',
                implementation: {
                  points: false,
                  badges: false,
                  streaks: false,
                  leaderboard: false
                }
              },
              {
                id: 'points_only',
                name: 'Points System',
                description: 'XP for activities',
                implementation: {
                  points: true,
                  pointsFor: ['problem_solved', 'concept_mastered', 'helping_others'],
                  badges: false,
                  streaks: false,
                  leaderboard: false
                }
              },
              {
                id: 'full_gamification',
                name: 'Full Gamification',
                description: 'All game elements',
                implementation: {
                  points: true,
                  badges: true,
                  badgeTypes: ['achievement', 'skill', 'social'],
                  streaks: true,
                  streakRewards: true,
                  leaderboard: true,
                  leaderboardTypes: ['class', 'school', 'global']
                }
              },
              {
                id: 'collaborative',
                name: 'Team-Based',
                description: 'Collaborative gamification',
                implementation: {
                  points: true,
                  teamPoints: true,
                  collaborativeChallenges: true,
                  teamLeaderboard: true,
                  peerHelp: true
                }
              }
            ],
            metrics: ['daily_active_users', 'session_frequency', 'time_between_sessions', 'streak_length'],
            clustering: 'classroom',
            duration: 30
          }
        ]
      },

      // ----------------------------------------
      // PREMIUM CONVERSION
      // ----------------------------------------
      
      premium_conversion: {
        name: 'Premium Conversion Optimization',
        category: 'monetization',
        description: 'Increase free to premium conversion rate',
        expectedImprovement: '5-10%',
        experiments: [
          {
            id: 'paywall_strategy',
            name: 'Paywall Strategy Test',
            hypothesis: 'Value-based paywalls convert better than hard limits',
            variants: [
              {
                id: 'control',
                name: 'Hard Limit',
                description: '10 problems per day',
                implementation: {
                  type: 'hard_limit',
                  limit: 10,
                  resetPeriod: 'daily',
                  message: 'Daily limit reached. Upgrade for unlimited access.'
                }
              },
              {
                id: 'soft_limit',
                name: 'Soft Limit',
                description: 'Premium features locked',
                implementation: {
                  type: 'feature_based',
                  freeFeatures: ['basic_problems', 'simple_explanations'],
                  premiumFeatures: ['step_by_step', 'video_explanations', 'practice_tests'],
                  teasers: true
                }
              },
              {
                id: 'value_moment',
                name: 'Value Moment',
                description: 'Paywall at high-value features',
                implementation: {
                  type: 'value_based',
                  triggers: ['difficult_problem_solved', 'concept_mastered', 'before_test'],
                  messaging: 'contextual',
                  emphasis: 'continued_success'
                }
              },
              {
                id: 'time_based',
                name: 'Time-Based',
                description: 'Free trial period',
                implementation: {
                  type: 'trial',
                  trialDuration: 7,
                  fullAccess: true,
                  reminder_schedule: [3, 5, 6, 7],
                  conversion_incentive: '20% off'
                }
              }
            ],
            metrics: ['conversion_rate', 'revenue_per_user', 'time_to_conversion', 'churn_rate'],
            duration: 30,
            revenueTracking: true
          },
          
          {
            id: 'pricing_display',
            name: 'Pricing Display Optimization',
            hypothesis: 'Anchoring and framing effects influence purchase decisions',
            variants: [
              {
                id: 'control',
                name: 'Standard Pricing',
                description: 'Monthly and annual options',
                implementation: {
                  plans: ['monthly', 'annual'],
                  display: 'side_by_side',
                  defaultSelection: 'monthly',
                  savings_display: 'percentage'
                }
              },
              {
                id: 'anchoring',
                name: 'Price Anchoring',
                description: 'Three-tier with recommended',
                implementation: {
                  plans: ['basic', 'recommended', 'premium'],
                  display: 'three_column',
                  defaultSelection: 'recommended',
                  visual_emphasis: 'recommended',
                  anchoring: 'premium_first'
                }
              },
              {
                id: 'value_focused',
                name: 'Value-Focused',
                description: 'Cost per problem solved',
                implementation: {
                  display: 'value_breakdown',
                  metrics_shown: ['cost_per_day', 'cost_per_problem', 'vs_tutoring'],
                  social_proof: true,
                  testimonials: 'results_focused'
                }
              },
              {
                id: 'urgency',
                name: 'Limited Time',
                description: 'Seasonal promotion',
                implementation: {
                  promotion: true,
                  discount: '30%',
                  urgency: 'countdown_timer',
                  scarcity: 'limited_spots',
                  fomo_messaging: true
                }
              }
            ],
            metrics: ['pricing_page_conversion', 'cart_abandonment', 'average_order_value'],
            duration: 21
          }
        ]
      },

      // ----------------------------------------
      // LEARNING EFFECTIVENESS
      // ----------------------------------------
      
      learning_effectiveness: {
        name: 'Learning Effectiveness Optimization',
        category: 'education',
        description: 'Improve actual learning outcomes',
        expectedImprovement: '10-20% learning gain',
        experiments: [
          {
            id: 'spaced_repetition',
            name: 'Spaced Repetition Algorithm',
            hypothesis: 'Optimized review schedules improve long-term retention',
            variants: [
              {
                id: 'control',
                name: 'No Repetition',
                description: 'Linear progression',
                implementation: {
                  algorithm: 'none',
                  review_prompts: false
                }
              },
              {
                id: 'basic_spaced',
                name: 'Basic Spacing',
                description: 'Fixed intervals',
                implementation: {
                  algorithm: 'fixed_interval',
                  intervals: [1, 3, 7, 14, 30], // days
                  review_prompts: true
                }
              },
              {
                id: 'adaptive_spaced',
                name: 'Adaptive Spacing',
                description: 'Based on performance',
                implementation: {
                  algorithm: 'sm2_modified',
                  difficulty_adjustment: true,
                  personal_forgetting_curve: true,
                  review_prompts: true
                }
              },
              {
                id: 'interleaved',
                name: 'Interleaved Practice',
                description: 'Mixed topic review',
                implementation: {
                  algorithm: 'interleaved',
                  topic_mixing: true,
                  difficulty_variation: true,
                  cognitive_load_balance: true
                }
              }
            ],
            metrics: ['retention_test_score', 'concept_mastery_rate', 'forgetting_curve'],
            clustering: 'classroom',
            duration: 60,
            requiresPrePost: true
          },
          
          {
            id: 'feedback_timing',
            name: 'Feedback Timing Optimization',
            hypothesis: 'Immediate feedback isn\'t always optimal for learning',
            variants: [
              {
                id: 'control',
                name: 'Immediate Feedback',
                description: 'Instant right/wrong',
                implementation: {
                  timing: 'immediate',
                  detail: 'simple',
                  allow_revision: false
                }
              },
              {
                id: 'delayed_feedback',
                name: 'Delayed Feedback',
                description: 'After problem set',
                implementation: {
                  timing: 'end_of_set',
                  detail: 'comprehensive',
                  allow_revision: true,
                  reflection_prompts: true
                }
              },
              {
                id: 'adaptive_feedback',
                name: 'Adaptive Feedback',
                description: 'Based on confidence',
                implementation: {
                  timing: 'adaptive',
                  confidence_check: true,
                  high_confidence_delay: true,
                  low_confidence_immediate: true,
                  detail: 'adaptive'
                }
              },
              {
                id: 'peer_feedback',
                name: 'Peer + AI Feedback',
                description: 'Collaborative learning',
                implementation: {
                  timing: 'hybrid',
                  peer_review: true,
                  ai_feedback: true,
                  discussion_prompts: true
                }
              }
            ],
            metrics: ['problem_solving_improvement', 'metacognition_score', 'transfer_learning_test'],
            clustering: 'individual',
            duration: 30
          }
        ]
      },

      // ----------------------------------------
      // MOBILE OPTIMIZATION
      // ----------------------------------------
      
      mobile_optimization: {
        name: 'Mobile Experience Optimization',
        category: 'user_experience',
        description: 'Optimize for mobile learning',
        expectedImprovement: '25-40% mobile engagement',
        experiments: [
          {
            id: 'mobile_ui_patterns',
            name: 'Mobile UI Patterns',
            hypothesis: 'Native app patterns increase mobile engagement',
            variants: [
              {
                id: 'control',
                name: 'Responsive Web',
                description: 'Standard responsive design',
                implementation: {
                  navigation: 'hamburger_menu',
                  gestures: false,
                  native_features: false
                }
              },
              {
                id: 'app_like',
                name: 'App-Like Interface',
                description: 'Native app patterns',
                implementation: {
                  navigation: 'bottom_tabs',
                  gestures: true,
                  gesture_types: ['swipe', 'pinch', 'long_press'],
                  native_features: ['haptic', 'full_screen'],
                  transitions: 'native_style'
                }
              },
              {
                id: 'progressive',
                name: 'Progressive Enhancement',
                description: 'PWA features',
                implementation: {
                  offline_mode: true,
                  install_prompts: true,
                  push_notifications: true,
                  background_sync: true,
                  native_share: true
                }
              }
            ],
            metrics: ['mobile_session_length', 'mobile_retention', 'mobile_problem_completion'],
            platform: 'mobile',
            duration: 21
          }
        ]
      }
    };
  }

  // ============================================
  // EXPERIMENT TEMPLATES
  // ============================================

  defineTemplates() {
    return {
      standard_ab: {
        name: 'Standard A/B Test',
        description: 'Simple two-variant test',
        structure: {
          type: 'ab',
          variants: [
            { id: 'control', name: 'Control', weight: 0.5 },
            { id: 'treatment', name: 'Treatment', weight: 0.5 }
          ],
          duration: 14,
          clustering: 'individual'
        }
      },
      
      multivariate: {
        name: 'Multivariate Test',
        description: 'Test multiple variables simultaneously',
        structure: {
          type: 'factorial',
          factors: {
            'headline': ['current', 'benefit_focused', 'outcome_focused'],
            'cta_color': ['blue', 'green', 'orange'],
            'social_proof': ['none', 'testimonial', 'statistics']
          },
          duration: 21,
          clustering: 'individual'
        }
      },
      
      sequential: {
        name: 'Sequential Test',
        description: 'Phased rollout with learning',
        structure: {
          type: 'sequential',
          phases: [
            { id: 'baseline', duration: 7, allocation: 1.0 },
            { id: 'test_10', duration: 7, allocation: 0.1 },
            { id: 'test_50', duration: 7, allocation: 0.5 },
            { id: 'full_rollout', duration: 7, allocation: 1.0 }
          ],
          clustering: 'school'
        }
      },
      
      classroom_cluster: {
        name: 'Classroom-Clustered Test',
        description: 'Whole classrooms assigned together',
        structure: {
          type: 'ab',
          clustering: 'classroom',
          stratification: ['grade_level', 'school_type'],
          minimum_cluster_size: 20,
          balance_factors: true
        }
      },
      
      learning_focused: {
        name: 'Learning Outcome Test',
        description: 'Focus on educational effectiveness',
        structure: {
          type: 'ab',
          clustering: 'individual',
          duration: 30,
          metrics_focus: 'learning',
          required_metrics: ['learning_gain', 'concept_mastery', 'retention_test'],
          pre_test_required: true,
          post_test_required: true
        }
      }
    };
  }

  // ============================================
  // BEST PRACTICES
  // ============================================

  defineBestPractices() {
    return {
      sample_size: {
        title: 'Sample Size Guidelines',
        guidelines: [
          {
            metric_type: 'conversion_rate',
            baseline_rate: 0.05,
            minimum_detectable_effect: 0.01,
            required_sample_size: 3842,
            duration_estimate: '2-3 weeks'
          },
          {
            metric_type: 'continuous_metric',
            baseline_mean: 100,
            baseline_std: 20,
            minimum_detectable_effect: 5,
            required_sample_size: 252,
            duration_estimate: '1-2 weeks'
          },
          {
            metric_type: 'retention_rate',
            baseline_rate: 0.30,
            minimum_detectable_effect: 0.05,
            required_sample_size: 738,
            duration_estimate: '3-4 weeks'
          }
        ]
      },
      
      clustering_effects: {
        title: 'Accounting for Clustering',
        guidelines: [
          {
            clustering_level: 'classroom',
            design_effect: 1.5,
            adjustment: 'Multiply sample size by 1.5',
            rationale: 'Students in same class are not independent'
          },
          {
            clustering_level: 'school',
            design_effect: 2.0,
            adjustment: 'Multiply sample size by 2.0',
            rationale: 'School-level factors create dependencies'
          }
        ]
      },
      
      ethical_considerations: {
        title: 'Ethical Testing Guidelines',
        principles: [
          'No student should receive inferior education',
          'All variants must meet minimum quality standards',
          'Parents/guardians should be informed of testing',
          'Students can opt out without penalty',
          'Learning outcomes take precedence over business metrics'
        ],
        safeguards: [
          'Automatic stopping for harmful variants',
          'Regular learning outcome monitoring',
          'Expert review for educational experiments',
          'Transparent reporting to stakeholders'
        ]
      },
      
      metric_selection: {
        title: 'Choosing the Right Metrics',
        framework: {
          primary_metrics: [
            'Should directly measure hypothesis',
            'Must be sensitive to change',
            'Should be reliable and valid'
          ],
          guardrail_metrics: [
            'Learning effectiveness',
            'User satisfaction',
            'Equity measures',
            'Technical performance'
          ],
          long_term_metrics: [
            'Retention after 30 days',
            'Learning transfer',
            'Grade improvement',
            'College readiness'
          ]
        }
      }
    };
  }

  // ============================================
  // EXPERIMENT BUILDER
  // ============================================

  buildExperiment(scenarioId, experimentId, customization = {}) {
    const scenario = this.scenarios[scenarioId];
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }
    
    const experimentTemplate = scenario.experiments.find(e => e.id === experimentId);
    if (!experimentTemplate) {
      throw new Error(`Experiment ${experimentId} not found in scenario ${scenarioId}`);
    }
    
    // Deep clone the template
    const experiment = JSON.parse(JSON.stringify(experimentTemplate));
    
    // Apply customizations
    Object.assign(experiment, customization);
    
    // Add metadata
    experiment.created_at = Date.now();
    experiment.scenario_id = scenarioId;
    experiment.status = 'draft';
    
    // Validate experiment
    this.validateExperiment(experiment);
    
    return experiment;
  }

  validateExperiment(experiment) {
    const errors = [];
    
    // Check required fields
    if (!experiment.name) errors.push('Experiment name is required');
    if (!experiment.hypothesis) errors.push('Hypothesis is required');
    if (!experiment.variants || experiment.variants.length < 2) {
      errors.push('At least 2 variants are required');
    }
    if (!experiment.metrics || experiment.metrics.length === 0) {
      errors.push('At least one metric is required');
    }
    
    // Check variant weights sum to 1
    if (experiment.variants) {
      const totalWeight = experiment.variants.reduce((sum, v) => sum + (v.weight || 0), 0);
      if (Math.abs(totalWeight - 1) > 0.01) {
        errors.push('Variant weights must sum to 1.0');
      }
    }
    
    // Check for control variant
    if (experiment.variants && !experiment.variants.find(v => v.id === 'control')) {
      errors.push('A control variant is required');
    }
    
    if (errors.length > 0) {
      throw new Error('Experiment validation failed: ' + errors.join(', '));
    }
    
    return true;
  }

  // ============================================
  // ANALYSIS HELPERS
  // ============================================

  calculateSampleSize(options) {
    const {
      metric_type = 'binary',
      baseline_value,
      minimum_detectable_effect,
      alpha = 0.05,
      power = 0.8,
      variants = 2,
      clustering = 'individual',
      cluster_size = 25
    } = options;
    
    let sampleSize;
    
    if (metric_type === 'binary') {
      // Binary outcome (conversion rate)
      const p1 = baseline_value;
      const p2 = baseline_value + minimum_detectable_effect;
      const p_bar = (p1 + p2) / 2;
      const z_alpha = this.getZScore(1 - alpha / 2);
      const z_beta = this.getZScore(power);
      
      sampleSize = 2 * Math.pow(z_alpha + z_beta, 2) * p_bar * (1 - p_bar) / 
                   Math.pow(p2 - p1, 2);
    } else {
      // Continuous outcome
      const sigma = options.standard_deviation || baseline_value * 0.2;
      const z_alpha = this.getZScore(1 - alpha / 2);
      const z_beta = this.getZScore(power);
      
      sampleSize = 2 * Math.pow(sigma, 2) * Math.pow(z_alpha + z_beta, 2) / 
                   Math.pow(minimum_detectable_effect, 2);
    }
    
    // Adjust for multiple variants
    if (variants > 2) {
      sampleSize = sampleSize * (variants - 1) / (variants - 2);
    }
    
    // Adjust for clustering
    let designEffect = 1;
    if (clustering === 'classroom') {
      const icc = 0.05; // Intraclass correlation
      designEffect = 1 + (cluster_size - 1) * icc;
    } else if (clustering === 'school') {
      const icc = 0.10;
      designEffect = 1 + (cluster_size - 1) * icc;
    }
    
    sampleSize = Math.ceil(sampleSize * designEffect);
    
    return {
      sample_size_per_variant: sampleSize,
      total_sample_size: sampleSize * variants,
      design_effect: designEffect,
      estimated_duration: this.estimateDuration(sampleSize, options)
    };
  }

  estimateDuration(sampleSizePerVariant, options) {
    const daily_traffic = options.daily_traffic || 500;
    const variants = options.variants || 2;
    const total_sample_needed = sampleSizePerVariant * variants;
    
    const days = Math.ceil(total_sample_needed / daily_traffic);
    
    return {
      days,
      weeks: Math.ceil(days / 7),
      recommendation: days < 14 ? 'Consider running longer for seasonal effects' : 
                     days > 60 ? 'Consider interim analysis to avoid long experiments' : 
                     'Duration looks appropriate'
    };
  }

  getZScore(probability) {
    // Inverse normal CDF approximation
    const a1 = -39.6968302866538, a2 = 220.946098424521, a3 = -275.928510446969;
    const a4 = 138.357751867269, a5 = -30.6647980661472, a6 = 2.50662827745924;
    const b1 = -54.4760987982241, b2 = 161.585836858041, b3 = -155.698979859887;
    const b4 = 66.8013118877197, b5 = -13.2806815528857;
    const c1 = -0.00778489400243029, c2 = -0.322396458041136, c3 = -2.40075827716184;
    const c4 = -2.54973253934373, c5 = 4.37466414146497, c6 = 2.93816398269878;
    const d1 = 0.00778469570904146, d2 = 0.32246712907004, d3 = 2.445134137143;
    const d4 = 3.75440866190742;
    
    const p_low = 0.02425, p_high = 1 - p_low;
    let q, r;
    
    if (probability < p_low) {
      q = Math.sqrt(-2 * Math.log(probability));
      return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
             ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else if (probability <= p_high) {
      q = probability - 0.5;
      r = q * q;
      return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
             (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - probability));
      return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
              ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
  }

  // ============================================
  // REPORTING TEMPLATES
  // ============================================

  generateExperimentReport(experiment, results) {
    return {
      executive_summary: this.generateExecutiveSummary(experiment, results),
      detailed_results: this.generateDetailedResults(experiment, results),
      statistical_analysis: this.generateStatisticalAnalysis(results),
      recommendations: this.generateRecommendations(experiment, results),
      next_steps: this.generateNextSteps(experiment, results),
      appendix: this.generateAppendix(experiment, results)
    };
  }

  generateExecutiveSummary(experiment, results) {
    const winner = results.winner;
    const primary_metric = results.metrics[experiment.metrics[0]];
    
    return {
      experiment_name: experiment.name,
      hypothesis: experiment.hypothesis,
      duration: `${results.duration_days} days`,
      participants: results.total_participants,
      result: winner ? 
        `${winner.variant} variant showed ${winner.improvement.toFixed(1)}% improvement` :
        'No statistically significant difference found',
      recommendation: winner && winner.improvement > 5 ? 
        `Implement ${winner.variant} variant` :
        'Continue with current approach',
      confidence_level: winner ? `${(winner.confidence * 100).toFixed(0)}%` : 'N/A'
    };
  }

  generateDetailedResults(experiment, results) {
    const detailed = {
      variants_performance: {},
      metrics_breakdown: {},
      segment_analysis: {}
    };
    
    // Variant performance
    experiment.variants.forEach(variant => {
      detailed.variants_performance[variant.id] = {
        participants: results.variants[variant.id]?.participants || 0,
        metrics: {}
      };
      
      experiment.metrics.forEach(metric => {
        const metricData = results.metrics[metric]?.variants[variant.id];
        if (metricData) {
          detailed.variants_performance[variant.id].metrics[metric] = {
            value: metricData.value,
            confidence_interval: metricData.confidence_interval,
            improvement: metricData.improvement,
            significant: metricData.significance?.significant
          };
        }
      });
    });
    
    return detailed;
  }

  generateStatisticalAnalysis(results) {
    return {
      methodology: 'Frequentist hypothesis testing with Bonferroni correction',
      assumptions_checked: [
        'Sample size adequacy',
        'Random assignment',
        'Independence of observations'
      ],
      statistical_tests: results.statistical_tests || {},
      power_analysis: results.power_analysis || {},
      effect_sizes: results.effect_sizes || {}
    };
  }

  generateRecommendations(experiment, results) {
    const recommendations = [];
    
    if (results.winner) {
      recommendations.push({
        priority: 'high',
        action: `Implement ${results.winner.variant} variant`,
        expected_impact: `${results.winner.improvement.toFixed(1)}% improvement in ${results.winner.metric}`,
        implementation_complexity: this.assessImplementationComplexity(experiment, results.winner.variant)
      });
    }
    
    // Learning-specific recommendations
    if (results.metrics.learning_gain) {
      const learningImpact = this.assessLearningImpact(results);
      if (learningImpact.concern) {
        recommendations.push({
          priority: 'critical',
          action: learningImpact.recommendation,
          rationale: learningImpact.rationale
        });
      }
    }
    
    return recommendations;
  }

  assessImplementationComplexity(experiment, winningVariantId) {
    const variant = experiment.variants.find(v => v.id === winningVariantId);
    if (!variant || !variant.implementation) return 'unknown';
    
    const impl = variant.implementation;
    let complexity = 0;
    
    // Assess various factors
    if (impl.requires_development) complexity += 3;
    if (impl.requires_design) complexity += 2;
    if (impl.affects_multiple_systems) complexity += 3;
    if (impl.requires_training) complexity += 2;
    
    if (complexity >= 7) return 'high';
    if (complexity >= 4) return 'medium';
    return 'low';
  }

  assessLearningImpact(results) {
    const learningMetrics = ['learning_gain', 'concept_mastery', 'retention_test_score'];
    let concern = false;
    let details = [];
    
    learningMetrics.forEach(metric => {
      if (results.metrics[metric]) {
        Object.entries(results.metrics[metric].variants).forEach(([variant, data]) => {
          if (variant !== 'control' && data.improvement < -5) {
            concern = true;
            details.push(`${variant} shows ${data.improvement.toFixed(1)}% decrease in ${metric}`);
          }
        });
      }
    });
    
    return {
      concern,
      recommendation: concern ? 'Do not implement variants that harm learning outcomes' : null,
      rationale: details.join('; ')
    };
  }

  generateNextSteps(experiment, results) {
    const steps = [];
    
    if (results.winner) {
      steps.push({
        step: 1,
        action: 'Schedule implementation planning meeting',
        timeline: 'Within 3 days',
        responsible: 'Product team'
      });
      
      steps.push({
        step: 2,
        action: 'Create implementation rollout plan',
        timeline: 'Within 1 week',
        responsible: 'Engineering team'
      });
      
      steps.push({
        step: 3,
        action: 'Monitor post-implementation metrics',
        timeline: 'Ongoing for 30 days',
        responsible: 'Analytics team'
      });
    } else {
      steps.push({
        step: 1,
        action: 'Review experiment design for improvements',
        timeline: 'Within 1 week',
        responsible: 'Experimentation team'
      });
      
      steps.push({
        step: 2,
        action: 'Consider follow-up experiments with larger effect sizes',
        timeline: 'Next sprint',
        responsible: 'Product team'
      });
    }
    
    return steps;
  }

  generateAppendix(experiment, results) {
    return {
      raw_data_location: '/data/experiments/' + experiment.id,
      analysis_code: '/analysis/experiments/' + experiment.id,
      pre_registration: experiment.pre_registration_url || 'Not pre-registered',
      deviations_from_plan: results.deviations || [],
      additional_analyses: results.additional_analyses || []
    };
  }
}

// Export
const educationalTestScenarios = new EducationalTestScenarios();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EducationalTestScenarios, educationalTestScenarios };
} else {
  window.EducationalTestScenarios = EducationalTestScenarios;
  window.educationalTestScenarios = educationalTestScenarios;
}