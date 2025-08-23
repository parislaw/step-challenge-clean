#!/usr/bin/env node

/**
 * Documentation Generator for StepTracker30
 * Analyzes codebase and generates/updates documentation files
 */

const fs = require('fs');
const path = require('path');

class DocumentationGenerator {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.backendPath = path.join(projectRoot, 'backend');
    this.frontendPath = path.join(projectRoot, 'frontend');
  }

  // Analyze backend API routes
  analyzeBackendRoutes() {
    const routesPath = path.join(this.backendPath, 'routes');
    const routes = {};
    
    if (!fs.existsSync(routesPath)) return routes;

    const routeFiles = fs.readdirSync(routesPath).filter(f => f.endsWith('.js'));
    
    routeFiles.forEach(file => {
      const filePath = path.join(routesPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const routeName = file.replace('.js', '');
      
      // Extract route definitions (simple regex matching)
      const routeMatches = content.match(/router\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g);
      
      if (routeMatches) {
        routes[routeName] = routeMatches.map(match => {
          const [, method, path] = match.match(/router\.(\w+)\(['"`]([^'"`]+)['"`]/);
          return { method: method.toUpperCase(), path: `/api/${routeName}${path === '/' ? '' : path}` };
        });
      }
    });

    return routes;
  }

  // Analyze React components
  analyzeReactComponents() {
    const components = { pages: [], components: [] };
    
    const pagesPath = path.join(this.frontendPath, 'src/pages');
    const componentsPath = path.join(this.frontendPath, 'src/components');

    if (fs.existsSync(pagesPath)) {
      components.pages = fs.readdirSync(pagesPath)
        .filter(f => f.endsWith('.js') || f.endsWith('.jsx'))
        .map(f => f.replace(/\.jsx?$/, ''));
    }

    if (fs.existsSync(componentsPath)) {
      components.components = fs.readdirSync(componentsPath)
        .filter(f => f.endsWith('.js') || f.endsWith('.jsx'))
        .map(f => f.replace(/\.jsx?$/, ''));
    }

    return components;
  }

  // Analyze package.json dependencies
  analyzePackages() {
    const packages = { backend: {}, frontend: {} };
    
    const backendPkg = path.join(this.backendPath, 'package.json');
    const frontendPkg = path.join(this.frontendPath, 'package.json');

    if (fs.existsSync(backendPkg)) {
      const pkg = JSON.parse(fs.readFileSync(backendPkg, 'utf8'));
      packages.backend = {
        dependencies: Object.keys(pkg.dependencies || {}),
        scripts: Object.keys(pkg.scripts || {})
      };
    }

    if (fs.existsSync(frontendPkg)) {
      const pkg = JSON.parse(fs.readFileSync(frontendPkg, 'utf8'));
      packages.frontend = {
        dependencies: Object.keys(pkg.dependencies || {}),
        scripts: Object.keys(pkg.scripts || {})
      };
    }

    return packages;
  }

  // Generate analysis report
  generateAnalysis() {
    return {
      routes: this.analyzeBackendRoutes(),
      components: this.analyzeReactComponents(),
      packages: this.analyzePackages(),
      timestamp: new Date().toISOString()
    };
  }
}

// CLI usage
if (require.main === module) {
  const projectRoot = process.argv[2] || process.cwd();
  const generator = new DocumentationGenerator(projectRoot);
  const analysis = generator.generateAnalysis();
  
  console.log(JSON.stringify(analysis, null, 2));
}

module.exports = DocumentationGenerator;