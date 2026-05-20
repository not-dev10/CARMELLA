import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

/**
 * Comprehensive Debug Script for Homepage Content Flow
 * Verifies: Database → Backend → Cache → Frontend
 */

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.carmellawholesale.uk';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: [],
};

// Simple color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

function log(level, title, data = '') {
  const levelColors = {
    INFO: colors.blue,
    SUCCESS: colors.green,
    ERROR: colors.red,
    WARN: colors.yellow,
    DEBUG: colors.gray,
  };

  const color = levelColors[level] || colors.reset;
  const timestamp = new Date().toLocaleTimeString();
  
  console.log(`${color}[${timestamp}] [${level}] ${title}${colors.reset}`);
  if (data) {
    console.log(`${color}${JSON.stringify(data, null, 2)}${colors.reset}`);
  }
  console.log('');

  if (level === 'SUCCESS') testResults.passed++;
  if (level === 'ERROR') {
    testResults.failed++;
    testResults.errors.push(`${title}: ${JSON.stringify(data)}`);
  }
  if (level === 'WARN') testResults.warnings++;
}

async function checkDatabaseStructure() {
  log('INFO', '=== STEP 1: DATABASE STRUCTURE CHECK ===');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const { data, error } = await supabase
      .from('admin_content')
      .select('section_name, content')
      .order('section_name');

    if (error) {
      log('ERROR', 'Failed to fetch from database', error);
      return null;
    }

    log('SUCCESS', `Found ${data.length} sections in database`);

    const sections = {};
    for (const item of data) {
      sections[item.section_name] = item.content;
      log('DEBUG', `Section: ${item.section_name}`, item.content);
    }

    return sections;
  } catch (error) {
    log('ERROR', 'Database connection failed', error.message);
    return null;
  }
}

async function checkExpectedStructures() {
  log('INFO', '=== STEP 2: VERIFY EXPECTED DATA STRUCTURES ===');

  const expected = {
    hero: {
      required: ['badge', 'title', 'subtitle', 'cta1Text', 'cta2Text', 'images'],
      description: 'Should have badge, title, subtitle, CTAs, and images array',
    },
    categories: {
      required: ['title', 'description'],
      description: 'Should have title and description',
    },
    products: {
      required: ['label', 'title', 'buttonText', 'description'],
      description: 'Should have label, title, button text, and description',
    },
    newsletter: {
      required: ['title', 'description'],
      description: 'Should have title and description',
    },
  };

  const dbSections = await checkDatabaseStructure();
  if (!dbSections) return false;

  let allValid = true;

  for (const [sectionName, rules] of Object.entries(expected)) {
    const content = dbSections[sectionName];
    
    if (!content) {
      log('WARN', `Missing section: ${sectionName}`, rules.description);
      continue;
    }

    const missingFields = rules.required.filter(field => !(field in content));

    if (missingFields.length > 0) {
      log('ERROR', `${sectionName}: Missing required fields`, { missing: missingFields, actual: Object.keys(content) });
      allValid = false;
    } else {
      log('SUCCESS', `${sectionName}: All required fields present`, Object.keys(content));
    }
  }

  return allValid;
}

async function checkAPIEndpoint() {
  log('INFO', '=== STEP 3: TEST API ENDPOINT ===');

  try {
    const response = await axios.get(`${API_BASE_URL}/api/homepage/content/hero`);
    
    log('SUCCESS', `API returned status ${response.status}`);
    log('DEBUG', 'API Response structure', { 
      keys: Object.keys(response.data),
      hasContent: !!response.data.content,
      contentKeys: response.data.content ? Object.keys(response.data.content) : 'N/A'
    });

    // Check response format
    if (!response.data.content) {
      log('ERROR', 'API response missing "content" field', response.data);
      return null;
    }

    if (!Array.isArray(response.data.content.images)) {
      log('WARN', 'Hero images is not an array', typeof response.data.content.images);
    }

    return response.data.content;
  } catch (error) {
    log('ERROR', 'API endpoint call failed', error.message);
    return null;
  }
}

async function simulateAdminEdit() {
  log('INFO', '=== STEP 4: SIMULATE ADMIN EDIT ===');

  try {
    // Get current hero content
    const response = await axios.get(`${API_BASE_URL}/api/homepage/content/hero`);
    const currentHero = response.data.content;

    log('DEBUG', 'Current hero content', { 
      title: currentHero?.title,
      hasImages: !!currentHero?.images
    });

    // Simulate editing just the title
    const testTitle = `TEST_DEBUG_${Date.now()}`;
    
    log('INFO', `Simulating edit: changing title to "${testTitle}"`);
    log('DEBUG', 'Sending partial update to backend', {
      section: 'hero',
      dataBeingSent: { title: testTitle }
    });

    // For now just log what would happen
    log('SUCCESS', 'Edit simulation prepared (not executed without auth token)');
    
    return { testTitle, currentHero };
  } catch (error) {
    log('ERROR', 'Failed to simulate admin edit', error.message);
    return null;
  }
}

async function checkHeroComponentExpectations() {
  log('INFO', '=== STEP 5: VERIFY HERO COMPONENT EXPECTATIONS ===');

  const heroComponentExpects = {
    badge: 'EST. 2024',
    title: 'string (from API)',
    subtitle: 'string (from API)',
    cta1Text: 'string (from API)',
    cta2Text: 'string (from API)',
    images: 'array of {desktopImage, mobileImage}',
    badge1Text: 'string (from API)',
    badge2Text: 'string (from API)',
    badge3Text: 'string (from API)',
  };

  log('DEBUG', 'Hero component expects these fields:', Object.keys(heroComponentExpects));

  const apiContent = await checkAPIEndpoint();
  if (!apiContent) {
    log('ERROR', 'Cannot verify hero component expectations - no API data');
    return false;
  }

  let allFound = true;
  for (const field of Object.keys(heroComponentExpects)) {
    if (field in apiContent) {
      log('SUCCESS', `Field present: ${field} = ${typeof apiContent[field]}`);
    } else {
      log('ERROR', `MISSING field: ${field}`, { hasFields: Object.keys(apiContent) });
      allFound = false;
    }
  }

  return allFound;
}

async function checkCacheLogic() {
  log('INFO', '=== STEP 6: CACHE LOGIC VERIFICATION ===');

  log('DEBUG', 'Cache middleware settings:');
  log('DEBUG', '  - Cache key format: /content/:section:{}');
  log('DEBUG', '  - When cleared: clearCache("/content/hero")');
  log('DEBUG', '  - Cache should match: key includes "content" and section name');

  // This is informational - actual cache clearing happens server-side
  log('INFO', 'Cache clearing flow:');
  log('DEBUG', '  1. Admin saves → backend receives PUT /api/homepage/content/hero');
  log('DEBUG', '  2. Backend updates DB with merged content');
  log('DEBUG', '  3. Backend calls clearCache("/content/hero")');
  log('DEBUG', '  4. Next GET returns fresh data from DB');
  log('DEBUG', '  5. Frontend receives current data and updates admin panel');

  log('SUCCESS', 'Cache logic chain documented');
}

async function checkDataFlowMerge() {
  log('INFO', '=== STEP 7: DATA MERGE VERIFICATION ===');

  log('DEBUG', 'When admin edits hero title:');
  log('DEBUG', '  Admin panel sends: { content: { title: "new value" } }');
  log('DEBUG', '  Backend should: merge with existing { ...existing, ...new }');
  log('DEBUG', '  Result should preserve: badge, images, etc.');

  const apiContent = await checkAPIEndpoint();
  if (!apiContent) {
    log('WARN', 'Cannot verify merge - no API data');
    return false;
  }

  // Check if all fields are present (would only happen if merge works)
  const hasAllFields = 
    !!apiContent.badge && 
    !!apiContent.title && 
    !!apiContent.subtitle && 
    Array.isArray(apiContent.images) &&
    apiContent.images.length > 0;

  if (hasAllFields) {
    log('SUCCESS', 'Data merge appears to be working - all fields present');
    return true;
  } else {
    log('ERROR', 'Data merge may be broken - missing fields', {
      badge: !!apiContent.badge,
      title: !!apiContent.title,
      images: Array.isArray(apiContent.images),
      imageCount: apiContent.images?.length || 0
    });
    return false;
  }
}

async function generateReport() {
  log('INFO', '=== FINAL REPORT ===');

  console.log(`${colors.bold}${colors.green}\n📊 TEST RESULTS:${colors.reset}`);
  console.log(`${colors.green}  ✓ Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}  ✗ Failed: ${testResults.failed}${colors.reset}`);
  console.log(`${colors.yellow}  ⚠ Warnings: ${testResults.warnings}${colors.reset}`);

  if (testResults.errors.length > 0) {
    console.log(`${colors.red}${colors.bold}\n❌ ERRORS FOUND:${colors.reset}`);
    testResults.errors.forEach((error, i) => {
      console.log(`${colors.red}  ${i + 1}. ${error}${colors.reset}`);
    });
  }

  console.log(`${colors.bold}\n🔍 TROUBLESHOOTING CHECKLIST:${colors.reset}`);
  console.log('  1. [ ] Database hero section has: badge, title, subtitle, cta1Text, cta2Text, images array');
  console.log('  2. [ ] API /homepage/content/hero returns all required fields');
  console.log('  3. [ ] Hero component can find images field and it\'s an array');
  console.log('  4. [ ] Backend merge logic preserves existing fields when updating');
  console.log('  5. [ ] Cache clearing actually removes old keys');
  console.log('  6. [ ] Admin panel sends complete merged data or partial updates only editable fields');

  console.log(`${colors.bold}\n💡 NEXT STEPS:${colors.reset}`);
  if (testResults.failed > 0) {
    console.log('  → Check database directly in Supabase for structure issues');
    console.log('  → Verify backend controllers are using merge logic');
    console.log('  → Check cache middleware pattern matching');
  } else {
    console.log('  → Test admin edit → save → refresh flow');
    console.log('  → Check if changes persist on home page');
  }
}

async function runFullDebug() {
  console.log(`${colors.bold}${colors.blue}\n🚀 STARTING COMPREHENSIVE DEBUG SCRIPT\n${colors.reset}`);
  console.log(`API URL: ${API_BASE_URL}\n`);

  try {
    await checkDatabaseStructure();
    await checkExpectedStructures();
    await checkAPIEndpoint();
    await simulateAdminEdit();
    await checkHeroComponentExpectations();
    await checkCacheLogic();
    await checkDataFlowMerge();
    await generateReport();
  } catch (error) {
    log('ERROR', 'Unexpected error during debug', error.message);
  }

  console.log(`${colors.bold}${colors.blue}\n✅ DEBUG SCRIPT COMPLETE\n${colors.reset}`);
  process.exit(testResults.failed > 0 ? 1 : 0);
}

runFullDebug();
