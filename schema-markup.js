// Schema Markup Generator for Math.help - SEO Optimization
// Implements Educational/Course, FAQ, HowTo, and MathML schemas

class SchemaMarkupGenerator {
    constructor() {
        this.baseUrl = 'https://math.help';
        this.organizationSchema = this.generateOrganizationSchema();
    }

    generateOrganizationSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Math.help",
            "url": this.baseUrl,
            "logo": `${this.baseUrl}/logo.png`,
            "description": "Interactive mathematics learning platform with step-by-step solutions and visual tools",
            "sameAs": [
                "https://twitter.com/mathhelp",
                "https://facebook.com/mathhelp",
                "https://youtube.com/mathhelp"
            ],
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-800-MATH-HELP",
                "contactType": "customer service"
            }
        };
    }

    generateEducationalSchema(topic, difficulty, concept) {
        return {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": `${concept} - ${topic}`,
            "description": `Learn ${concept} in ${topic} with interactive tools and step-by-step solutions`,
            "provider": {
                "@type": "Organization",
                "name": "Math.help",
                "url": this.baseUrl
            },
            "courseCode": `${topic.toUpperCase()}-${difficulty.toUpperCase()}-${concept.replace(/\s+/g, '')}`,
            "educationalLevel": difficulty,
            "about": {
                "@type": "Thing",
                "name": concept,
                "description": `Mathematical concept: ${concept}`
            },
            "teaches": concept,
            "coursePrerequisites": this.getPrerequisites(topic, difficulty),
            "timeRequired": "PT30M",
            "inLanguage": "en-US",
            "isAccessibleForFree": true,
            "learningResourceType": "Interactive Tutorial",
            "educationalUse": "instruction",
            "typicalAgeRange": this.getAgeRange(difficulty),
            "url": `${this.baseUrl}/topics/${topic}/${difficulty}/${concept.replace(/\s+/g, '-').toLowerCase()}`
        };
    }

    generateHowToSchema(problemType, steps) {
        return {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": `How to Solve ${problemType}`,
            "description": `Step-by-step guide to solving ${problemType} problems with examples`,
            "image": `${this.baseUrl}/images/howto-${problemType.replace(/\s+/g, '-').toLowerCase()}.jpg`,
            "totalTime": "PT15M",
            "estimatedCost": {
                "@type": "MonetaryAmount",
                "currency": "USD",
                "value": "0"
            },
            "tool": [
                {
                    "@type": "HowToTool",
                    "name": "Calculator"
                },
                {
                    "@type": "HowToTool", 
                    "name": "Pencil and Paper"
                }
            ],
            "step": steps.map((step, index) => ({
                "@type": "HowToStep",
                "position": index + 1,
                "name": step.name,
                "text": step.description,
                "image": step.image ? `${this.baseUrl}/images/steps/${step.image}` : undefined,
                "url": `${this.baseUrl}/solve/${problemType.replace(/\s+/g, '-').toLowerCase()}#step-${index + 1}`
            }))
        };
    }

    generateFAQSchema(topic, faqs) {
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "name": `${topic} - Frequently Asked Questions`,
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer,
                    "url": `${this.baseUrl}/topics/${topic.replace(/\s+/g, '-').toLowerCase()}#faq-${faq.id}`
                }
            }))
        };
    }

    generateMathMLSchema(equation, solution) {
        return {
            "@context": "https://schema.org",
            "@type": "MathSolver",
            "name": "Mathematical Equation Solver",
            "description": "Solve mathematical equations step by step",
            "potentialAction": {
                "@type": "SolveMathAction",
                "object": {
                    "@type": "MathExpression",
                    "mathExpression": equation,
                    "solution": solution
                }
            }
        };
    }

    generateBreadcrumbSchema(breadcrumbs) {
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": crumb.name,
                "item": `${this.baseUrl}${crumb.url}`
            }))
        };
    }

    generateVideoSchema(videoId, title, description, duration) {
        return {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": title,
            "description": description,
            "thumbnailUrl": `${this.baseUrl}/images/video-thumbs/${videoId}.jpg`,
            "uploadDate": new Date().toISOString(),
            "duration": duration,
            "contentUrl": `${this.baseUrl}/videos/${videoId}`,
            "embedUrl": `${this.baseUrl}/embed/${videoId}`,
            "interactionStatistic": {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/WatchAction",
                "userInteractionCount": 0
            }
        };
    }

    generateProblemSetSchema(problemSet) {
        return {
            "@context": "https://schema.org",
            "@type": "Quiz",
            "name": problemSet.title,
            "description": problemSet.description,
            "about": problemSet.topic,
            "educationalLevel": problemSet.difficulty,
            "timeRequired": `PT${problemSet.estimatedTime}M`,
            "hasPart": problemSet.problems.map((problem, index) => ({
                "@type": "Question",
                "position": index + 1,
                "name": problem.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": problem.answer,
                    "explanation": problem.explanation
                }
            }))
        };
    }

    getPrerequisites(topic, difficulty) {
        const prerequisites = {
            'algebra': {
                'beginner': ['Basic Arithmetic', 'Fractions'],
                'intermediate': ['Linear Equations', 'Factoring'],
                'advanced': ['Quadratic Equations', 'Polynomial Operations']
            },
            'calculus': {
                'beginner': ['Algebra', 'Functions'],
                'intermediate': ['Limits', 'Derivatives'],
                'advanced': ['Integration', 'Differential Equations']
            },
            'geometry': {
                'beginner': ['Basic Shapes', 'Measurement'],
                'intermediate': ['Triangles', 'Circles'],
                'advanced': ['Coordinate Geometry', 'Proofs']
            }
        };

        return prerequisites[topic]?.[difficulty] || [];
    }

    getAgeRange(difficulty) {
        const ageRanges = {
            'beginner': '13-15',
            'intermediate': '15-17',
            'advanced': '17-19'
        };

        return ageRanges[difficulty] || '13-19';
    }

    injectSchemaMarkup(schema, elementId = 'schema-markup') {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = elementId;
        script.textContent = JSON.stringify(schema, null, 2);
        
        // Remove existing schema if present
        const existing = document.getElementById(elementId);
        if (existing) {
            existing.remove();
        }
        
        document.head.appendChild(script);
    }

    generateComprehensivePageSchema(pageData) {
        const schemas = [];

        // Always include organization schema
        schemas.push(this.organizationSchema);

        // Add specific schemas based on page type
        if (pageData.type === 'course') {
            schemas.push(this.generateEducationalSchema(
                pageData.topic, 
                pageData.difficulty, 
                pageData.concept
            ));
        }

        if (pageData.type === 'howto') {
            schemas.push(this.generateHowToSchema(
                pageData.problemType, 
                pageData.steps
            ));
        }

        if (pageData.faqs && pageData.faqs.length > 0) {
            schemas.push(this.generateFAQSchema(
                pageData.topic, 
                pageData.faqs
            ));
        }

        if (pageData.breadcrumbs) {
            schemas.push(this.generateBreadcrumbSchema(pageData.breadcrumbs));
        }

        if (pageData.equation && pageData.solution) {
            schemas.push(this.generateMathMLSchema(
                pageData.equation, 
                pageData.solution
            ));
        }

        if (pageData.video) {
            schemas.push(this.generateVideoSchema(
                pageData.video.id,
                pageData.video.title,
                pageData.video.description,
                pageData.video.duration
            ));
        }

        if (pageData.problemSet) {
            schemas.push(this.generateProblemSetSchema(pageData.problemSet));
        }

        return schemas;
    }
}

// Auto-initialize schema markup based on page content
document.addEventListener('DOMContentLoaded', function() {
    const schemaGenerator = new SchemaMarkupGenerator();
    
    // Detect page type and generate appropriate schema
    const pageType = document.body.getAttribute('data-page-type');
    const pageData = JSON.parse(document.body.getAttribute('data-page-data') || '{}');
    
    if (pageType && pageData) {
        const schemas = schemaGenerator.generateComprehensivePageSchema({
            type: pageType,
            ...pageData
        });
        
        schemas.forEach((schema, index) => {
            schemaGenerator.injectSchemaMarkup(schema, `schema-markup-${index}`);
        });
    }
});

// Export for use in other modules
window.SchemaMarkupGenerator = SchemaMarkupGenerator;