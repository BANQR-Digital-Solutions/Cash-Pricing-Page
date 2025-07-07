// Global configuration object
let config = null;

// Load configuration from JSON file
async function loadConfig() {
    try {
        const response = await fetch('./config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        config = await response.json();
        console.log('Configuration loaded successfully');
        return config;
    } catch (error) {
        console.error('Error loading configuration:', error);
        // Fallback configuration
        config = {
            meta: {
                title: "Choose Your Plan",
                subtitle: "Find the perfect plan for your team",
                currency: "$"
            },
            plans: [
                {
                    id: "base",
                    name: "Base",
                    pricing: { monthly: 29, yearly: 290, includedUsers: 3, additionalUserCostMonthly: 5, additionalUserCostYearly: 50, type: "base_with_additional" }
                },
                {
                    id: "pro", 
                    name: "Pro",
                    pricing: { monthly: 15, yearly: 150, type: "per_user" }
                },
                {
                    id: "enterprise",
                    name: "Enterprise", 
                    pricing: { monthly: 299, yearly: 2990, type: "flat_rate" }
                }
            ],
            settings: { defaultUserCount: 5, minUserCount: 1 }
        };
        return config;
    }
}

// DOM elements
const billingToggle = document.getElementById('billingToggle');
const monthlyText = document.getElementById('monthlyText');
const yearlyText = document.getElementById('yearlyText');
const userCountInput = document.getElementById('userCount');

// Price elements
const basePrice = document.getElementById('basePrice');
const basePeriod = document.getElementById('basePeriod');
const baseTotalPrice = document.getElementById('baseTotalPrice');
const baseTotalPeriod = document.getElementById('baseTotalPeriod');
const baseAdditionalInfo = document.getElementById('baseAdditionalInfo');

const proPrice = document.getElementById('proPrice');
const proPeriod = document.getElementById('proPeriod');
const proTotalPrice = document.getElementById('proTotalPrice');
const proTotalPeriod = document.getElementById('proTotalPeriod');

const enterprisePrice = document.getElementById('enterprisePrice');
const enterprisePeriod = document.getElementById('enterprisePeriod');
const enterpriseTotalPrice = document.getElementById('enterpriseTotalPrice');
const enterpriseTotalPeriod = document.getElementById('enterpriseTotalPeriod');

// Initialize
let isYearly = false;
let userCount = 5;
let selectedPlans = new Set(); // Track selected plans

// Initialize the application
async function initApp() {
    await loadConfig();
    
    // Set default user count from config
    userCount = config.settings.defaultUserCount;
    userCountInput.value = userCount;
    userCountInput.min = config.settings.minUserCount;
    if (config.settings.maxUserCount) {
        userCountInput.max = config.settings.maxUserCount;
    }
    
    // Update page title if configured
    if (config.meta) {
        const header = document.querySelector('header h1');
        const subtitle = document.querySelector('header p');
        if (header) header.textContent = config.meta.title;
        if (subtitle) subtitle.textContent = config.meta.subtitle;
    }
    
    // Initialize selected plans with mandatory plans
    config.plans.forEach(plan => {
        if (plan.mandatory) {
            selectedPlans.add(plan.id);
        }
    });
    
    // Initialize yearly discount display
    updateYearlyDiscountDisplay();
    
    // Generate pricing cards dynamically
    generatePricingCards();
    
    // Generate comparison table
    generateComparisonTable();
    
    // Add event listeners with debouncing
    billingToggle.addEventListener('change', toggleBilling);
    userCountInput.addEventListener('input', debounceUpdateUserCount);
    
    // Initialize pricing
    updatePricing();
    
    // Initialize animations
    initAnimations();
    
    // Add smooth scrolling
    initSmoothScrolling();
}

// Toggle billing period
function toggleBilling() {
    isYearly = billingToggle.checked;
    
    // Update toggle text styling
    if (isYearly) {
        monthlyText.classList.remove('active');
        yearlyText.classList.add('active');
    } else {
        monthlyText.classList.add('active');
        yearlyText.classList.remove('active');
    }
    
    // Show/hide yearly discount
    updateYearlyDiscountDisplay();
    
    // Update all pricing displays
    updatePricing();
    
    // Update total summary period text
    const totalPeriodElement = document.getElementById('totalPeriod');
    if (totalPeriodElement) {
        totalPeriodElement.textContent = isYearly ? '/year' : '/month';
    }
}

// Update yearly discount display
function updateYearlyDiscountDisplay() {
    const yearlyDiscountElement = document.getElementById('yearlyDiscount');
    const discountTextElement = yearlyDiscountElement?.querySelector('.discount-text');
    
    if (!yearlyDiscountElement || !config?.settings?.showYearlyDiscount) return;
    
    if (isYearly) {
        yearlyDiscountElement.style.display = 'block';
        if (discountTextElement && config.settings.yearlyDiscount) {
            discountTextElement.textContent = config.settings.yearlyDiscount;
        }
    } else {
        yearlyDiscountElement.style.display = 'none';
    }
}

// Generate pricing cards dynamically
function generatePricingCards() {
    const pricingGrid = document.querySelector('.pricing-grid');
    pricingGrid.innerHTML = '';
    
    config.plans.forEach(plan => {
        const isSelected = selectedPlans.has(plan.id);
        const cardHTML = `
            <div class="pricing-card${plan.popular ? ' popular' : ''}${isSelected ? ' selected' : ''}" data-plan-id="${plan.id}">
                ${plan.popular ? '<div class="popular-badge">Most Popular</div>' : ''}
                ${plan.mandatory ? '<div class="mandatory-badge">Required</div>' : ''}
                <div class="plan-header">
                    <div class="plan-selection">
                        <input type="checkbox" id="plan-${plan.id}" class="plan-checkbox" ${isSelected ? 'checked' : ''} ${plan.mandatory ? 'disabled' : ''}>
                        <label for="plan-${plan.id}" class="plan-title">
                            <h3>${plan.name}</h3>
                        </label>
                    </div>
                    <div class="price">
                        <span class="currency">${config.meta?.currency || '$'}</span>
                        <span class="amount" id="${plan.id}Price">${plan.pricing.monthly}</span>
                        <span class="period" id="${plan.id}Period">/month</span>
                    </div>
                    <p class="plan-description">${plan.description}</p>
                    <div class="user-info">
                        <span id="${plan.id}UserInfo">${getUserInfoText(plan)}</span>
                    </div>
                    <div class="additional-cost-info${plan.pricing.type === 'base_with_additional' ? '' : ' empty'}">
                        ${plan.pricing.type === 'base_with_additional' ? 
                            `<span id="${plan.id}AdditionalInfo" class="additional-info">+${config.meta?.currency || '$'}${plan.pricing.additionalUserCostMonthly}/user/month for additional users</span>` : 
                            `<span id="${plan.id}AdditionalInfo" class="additional-info placeholder">&nbsp;</span>`}
                    </div>
                </div>
                <div class="total-price">
                    <strong>Plan Total: ${config.meta?.currency || '$'}<span id="${plan.id}TotalPrice">${plan.pricing.monthly}</span><span id="${plan.id}TotalPeriod">/month</span></strong>
                </div>
            </div>
        `;
        pricingGrid.innerHTML += cardHTML;
    });
    
    // Add event listeners for plan selection
    document.querySelectorAll('.plan-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const planId = this.id.replace('plan-', '');
            handlePlanSelection(planId, this.checked);
        });
    });
}

// Handle plan selection
function handlePlanSelection(planId, isChecked) {
    const card = document.querySelector(`[data-plan-id="${planId}"]`);
    
    if (isChecked) {
        selectedPlans.add(planId);
        card.classList.add('selected');
    } else {
        selectedPlans.delete(planId);
        card.classList.remove('selected');
    }
    
    updateTotalSummary();
    updatePricing();
}

// Update total summary
function updateTotalSummary() {
    const selectedPlansList = document.getElementById('selectedPlansList');
    const totalCostElement = document.getElementById('totalCost');
    const totalPeriodElement = document.getElementById('totalPeriod');
    const userCountSummary = document.getElementById('userCountSummary');
    
    // Update user count summary
    userCountSummary.textContent = userCount;
    
    // Clear previous content
    selectedPlansList.innerHTML = '';
    
    let totalCost = 0;
    const period = isYearly ? 'yearly' : 'monthly';
    const periodText = isYearly ? '/year' : '/month';
    
    selectedPlans.forEach(planId => {
        const plan = config.plans.find(p => p.id === planId);
        if (!plan) return;
        
        let planCost = calculatePlanCost(plan, userCount, isYearly);
        totalCost += planCost;
        
        // Add to selected plans list
        const planItem = document.createElement('div');
        planItem.className = 'selected-plan-item';
        planItem.innerHTML = `
            <div class="plan-item-header">
                <span class="plan-name">${plan.name}</span>
                <span class="plan-cost">${config.meta?.currency || '$'}${formatPrice(planCost)}${periodText}</span>
            </div>
            <div class="plan-item-details">
                <small>${getPlanCostBreakdown(plan, userCount, isYearly)}</small>
            </div>
        `;
        selectedPlansList.appendChild(planItem);
    });
    
    // Update total cost
    totalCostElement.textContent = (config.meta?.currency || '$') + formatPrice(totalCost);
    totalPeriodElement.textContent = periodText;
    
    // Show/hide summary based on selection
    const summaryCard = document.querySelector('.total-summary');
    if (selectedPlans.size > 0) {
        summaryCard.style.display = 'block';
    } else {
        summaryCard.style.display = 'none';
    }
}

// Calculate cost for a single plan
function calculatePlanCost(plan, userCount, isYearly) {
    const period = isYearly ? 'yearly' : 'monthly';
    let cost = 0;
    
    switch (plan.pricing.type) {
        case 'base_with_additional':
            cost = plan.pricing[period];
            if (userCount > plan.pricing.includedUsers) {
                const additionalUsers = userCount - plan.pricing.includedUsers;
                const additionalCostKey = isYearly ? 'additionalUserCostYearly' : 'additionalUserCostMonthly';
                cost += additionalUsers * plan.pricing[additionalCostKey];
            }
            break;
        case 'per_user':
            cost = userCount * plan.pricing[period];
            break;
        case 'flat_rate':
            cost = plan.pricing[period];
            break;
    }
    
    return cost;
}

// Get cost breakdown text for a plan
function getPlanCostBreakdown(plan, userCount, isYearly) {
    const period = isYearly ? 'yearly' : 'monthly';
    const periodText = isYearly ? '/year' : '/month';
    
    switch (plan.pricing.type) {
        case 'base_with_additional':
            if (userCount > plan.pricing.includedUsers) {
                const additionalUsers = userCount - plan.pricing.includedUsers;
                return `${config.meta?.currency || '$'}${plan.pricing[period]}${periodText} base + ${additionalUsers} additional users`;
            }
            return `${config.meta?.currency || '$'}${plan.pricing[period]}${periodText} for ${plan.pricing.includedUsers} users`;
        case 'per_user':
            return `${config.meta?.currency || '$'}${plan.pricing[period]}${periodText} × ${userCount} users`;
        case 'flat_rate':
            return `${config.meta?.currency || '$'}${plan.pricing[period]}${periodText} flat rate`;
        default:
            return '';
    }
}

// Get user info text for a plan
function getUserInfoText(plan) {
    switch (plan.pricing.type) {
        case 'base_with_additional':
            if (userCount <= plan.pricing.includedUsers) {
                return `Includes ${plan.pricing.includedUsers} users`;
            } else {
                const additionalUsers = userCount - plan.pricing.includedUsers;
                return `Includes ${plan.pricing.includedUsers} users + ${additionalUsers} additional`;
            }
        case 'per_user':
            return `Per user pricing (${userCount} users)`;
        case 'flat_rate':
            return `Flat rate for unlimited users`;
        default:
            return '';
    }
}

// Generate comparison table dynamically
function generateComparisonTable() {
    const comparisonSection = document.querySelector('.feature-comparison');
    if (!config.comparisonTable) return;
    
    const tableHTML = `
        <h2>${config.comparisonTable.title}</h2>
        <div class="comparison-table">
            <table>
                <thead>
                    <tr>
                        <th>Features</th>
                        ${config.plans.map(plan => `<th>${plan.name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${config.comparisonTable.rows.map(row => `
                        <tr>
                            <td>${row.feature}</td>
                            ${config.plans.map(plan => {
                                const value = row[plan.id];
                                if (typeof value === 'boolean') {
                                    return `<td><span class="${value ? 'checkmark' : 'cross'}">${value ? '✓' : '✗'}</span></td>`;
                                }
                                return `<td>${value}</td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    comparisonSection.innerHTML = tableHTML;
}

// Update user count
function updateUserCount() {
    const minUsers = config?.settings?.minUserCount || 1;
    const maxUsers = config?.settings?.maxUserCount || 1000;
    
    userCount = parseInt(userCountInput.value) || minUsers;
    if (userCount < minUsers) {
        userCount = minUsers;
        userCountInput.value = minUsers;
    }
    if (userCount > maxUsers) {
        userCount = maxUsers;
        userCountInput.value = maxUsers;
    }
    
    // Update user info displays
    updateUserInfoDisplays();
    
    // Update all pricing
    updatePricing();
}

// Calculate and update pricing
function updatePricing() {
    if (!config) return;
    
    const period = isYearly ? 'yearly' : 'monthly';
    const periodText = isYearly ? '/year' : '/month';
    const userPeriodText = isYearly ? '/user/year' : '/user/month';
    
    config.plans.forEach(plan => {
        const priceElement = document.getElementById(`${plan.id}Price`);
        const periodElement = document.getElementById(`${plan.id}Period`);
        const totalPriceElement = document.getElementById(`${plan.id}TotalPrice`);
        const totalPeriodElement = document.getElementById(`${plan.id}TotalPeriod`);
        const additionalInfoElement = document.getElementById(`${plan.id}AdditionalInfo`);
        const userInfoElement = document.getElementById(`${plan.id}UserInfo`);
        
        if (!priceElement) return;
        
        let totalCost = 0;
        let displayPrice = 0;
        let displayPeriod = periodText;
        
        switch (plan.pricing.type) {
            case 'base_with_additional':
                displayPrice = plan.pricing[period];
                totalCost = plan.pricing[period];
                
                if (userCount > plan.pricing.includedUsers) {
                    const additionalUsers = userCount - plan.pricing.includedUsers;
                    const additionalCostKey = isYearly ? 'additionalUserCostYearly' : 'additionalUserCostMonthly';
                    const additionalCost = additionalUsers * plan.pricing[additionalCostKey];
                    totalCost += additionalCost;
                }
                
                // Update additional info
                if (additionalInfoElement) {
                    const additionalCostKey = isYearly ? 'additionalUserCostYearly' : 'additionalUserCostMonthly';
                    const additionalPeriodText = isYearly ? '/user/year' : '/user/month';
                    additionalInfoElement.textContent = `+${config.meta?.currency || '$'}${plan.pricing[additionalCostKey]}${additionalPeriodText} for additional users`;
                }
                break;
                
            case 'per_user':
                displayPrice = plan.pricing[period];
                displayPeriod = userPeriodText;
                totalCost = userCount * plan.pricing[period];
                break;
                
            case 'flat_rate':
                displayPrice = plan.pricing[period];
                totalCost = plan.pricing[period];
                break;
        }
        
        // Update display
        priceElement.textContent = formatPrice(displayPrice);
        periodElement.textContent = displayPeriod;
        totalPriceElement.textContent = formatPrice(totalCost);
        totalPeriodElement.textContent = periodText;
        
        // Update user info if element exists
        if (userInfoElement) {
            userInfoElement.textContent = getUserInfoText(plan);
        }
    });
    
    // Update total summary after individual plan prices are updated
    updateTotalSummary();
}

// Format numbers with commas for better readability
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Add animation effects
// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add some debugging to ensure initialization
    console.log('DOM loaded, initializing app...');
    initApp().catch(error => {
        console.error('Error initializing app:', error);
    });
});

// Add animation effects for pricing cards
function initAnimations() {
    const cards = document.querySelectorAll('.pricing-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Add smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Debounced user count update
let updateTimeout;
function debounceUpdateUserCount() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(updateUserCount, 300);
}

// Update user info displays
function updateUserInfoDisplays() {
    config.plans.forEach(plan => {
        const userInfoElement = document.getElementById(`${plan.id}UserInfo`);
        if (userInfoElement) {
            userInfoElement.textContent = getUserInfoText(plan);
        }
    });
}
