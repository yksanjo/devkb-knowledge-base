#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { glob } from 'glob';
import ora from 'ora';

const program = new Command();

interface Config {
  dataDir: string;
  indexPaths: string[];
  excludePatterns: string[];
}

function getConfig(): Config {
  const configPath = join(process.cwd(), '.devkb.json');
  const defaultConfig: Config = {
    dataDir: '.devkb',
    indexPaths: ['./src', './lib', './docs'],
    excludePatterns: ['node_modules', 'dist', 'build', '.git', '*.log']
  };

  if (existsSync(configPath)) {
    try {
      const configData = readFileSync(configPath, 'utf-8');
      return { ...defaultConfig, ...JSON.parse(configData) };
    } catch {
      return defaultConfig;
    }
  }
  return defaultConfig;
}

function ensureDataDir(config: Config): void {
  const dataDir = join(process.cwd(), config.dataDir);
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

program
  .name('devkb')
  .description('Developer Knowledge Base - CLI tool for indexing and querying your codebase')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize DevKB in the current directory')
  .action(() => {
    console.log(chalk.blue('Initializing DevKB...'));
    
    const configPath = join(process.cwd(), '.devkb.json');
    const defaultConfig = {
      dataDir: '.devkb',
      indexPaths: ['./src', './lib', './docs', './tests'],
      excludePatterns: ['node_modules', 'dist', 'build', '.git', '*.log', '.env'],
      includeExtensions: ['.ts', '.js', '.jsx', '.tsx', '.md', '.txt', '.json', '.yml', '.yaml']
    };

    writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    
    const dataDir = join(process.cwd(), '.devkb');
    mkdirSync(dataDir, { recursive: true });
    mkdirSync(join(dataDir, 'knowledge'), { recursive: true });
    mkdirSync(join(dataDir, 'index'), { recursive: true });

    console.log(chalk.green('✓ DevKB initialized successfully!'));
    console.log(chalk.gray('Created:'));
    console.log(chalk.gray('  - .devkb.json'));
    console.log(chalk.gray('  - .devkb/knowledge/'));
    console.log(chalk.gray('  - .devkb/index/'));
  });

program
  .command('index')
  .description('Index codebase files for searching')
  .option('-p, --paths <paths>', 'Comma-separated paths to index')
  .option('-f, --force', 'Force re-indexing')
  .action(async (options) => {
    const spinner = ora('Indexing codebase...').start();
    const config = getConfig();
    
    try {
      ensureDataDir(config);
      
      const paths = options.paths 
        ? options.paths.split(',') 
        : config.indexPaths;
      
      const allFiles: string[] = [];
      
      for (const path of paths) {
        const pattern = join(path, '**/*');
        const files = await glob(pattern, {
          ignore: config.excludePatterns,
          nodir: true
        });
        allFiles.push(...files);
      }

      const indexData = allFiles.map(file => ({
        path: file,
        name: file.split('/').pop() || file,
        ext: extname(file)
      }));

      const indexPath = join(process.cwd(), config.dataDir, 'index', 'files.json');
      writeFileSync(indexPath, JSON.stringify(indexData, null, 2));

      spinner.succeed(`Indexed ${indexData.length} files`);
      
      console.log(chalk.green('\n✓ Indexing complete!'));
      console.log(chalk.gray(`Total files indexed: ${indexData.length}`));
    } catch (error) {
      spinner.fail('Indexing failed');
      console.error(chalk.red('Error:'), error);
    }
  });

program
  .command('search <query>')
  .description('Search indexed files')
  .option('-t, --type <type>', 'Filter by file type')
  .option('-l, --limit <limit>', 'Limit results', '10')
  .action((query, options) => {
    const config = getConfig();
    const indexPath = join(process.cwd(), config.dataDir, 'index', 'files.json');
    
    if (!existsSync(indexPath)) {
      console.log(chalk.yellow('No index found. Run "devkb index" first.'));
      return;
    }

    const indexData = JSON.parse(readFileSync(indexPath, 'utf-8'));
    const queryLower = query.toLowerCase();
    
    const results = indexData
      .filter((file: any) => file.name.toLowerCase().includes(queryLower))
      .slice(0, parseInt(options.limit));

    if (results.length === 0) {
      console.log(chalk.yellow('No results found.'));
      return;
    }

    console.log(chalk.blue(`\nFound ${results.length} results for "${query}":\n`));
    
    results.forEach((file: any, i: number) => {
      console.log(chalk.gray(`${i + 1}. ${file.path}`));
      console.log(chalk.gray(`   Type: ${file.ext}\n`));
    });
  });

program
  .command('ask <question>')
  .description('Ask a question about your codebase')
  .action((question) => {
    console.log(chalk.blue(`\nQuestion: ${question}\n`));
    
    const config = getConfig();
    const knowledgePath = join(process.cwd(), config.dataDir, 'knowledge');
    
    // Simulated response for demo
    console.log(chalk.green('Answer:'));
    console.log('Based on the indexed codebase, here are some insights:\n');
    console.log(chalk.gray('1. Code structure analysis would be performed here'));
    console.log(chalk.gray('2. Relevant files would be searched'));
    console.log(chalk.gray('3. Context would be extracted and summarized\n'));
    console.log(chalk.yellow('💡 Tip: Run "devkb index" first to ensure your codebase is indexed.'));
  });

program
  .command('add <type>')
  .description('Add a knowledge entry (code|doc|decision|conversation)')
  .argument('<type>', 'Type of entry')
  .option('-t, --title <title>', 'Entry title')
  .option('-c, --content <content>', 'Entry content')
  .option('--tags <tags>', 'Comma-separated tags')
  .action((type, options) => {
    const config = getConfig();
    ensureDataDir(config);
    
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: options.title || 'Untitled',
      content: options.content || '',
      tags: options.tags ? options.tags.split(',') : [],
      createdAt: new Date().toISOString()
    };

    const knowledgePath = join(process.cwd(), config.dataDir, 'knowledge', `${entry.id}.json`);
    writeFileSync(knowledgePath, JSON.stringify(entry, null, 2));

    console.log(chalk.green(`\n✓ Added ${type} entry: ${entry.title}`));
  });

program
  .command('list')
  .description('List all knowledge entries')
  .option('-t, --type <type>', 'Filter by type')
  .action((options) => {
    const config = getConfig();
    const knowledgePath = join(process.cwd(), config.dataDir, 'knowledge');
    
    if (!existsSync(knowledgePath)) {
      console.log(chalk.yellow('No knowledge entries found.'));
      return;
    }

    const { readdirSync } = require('fs');
    const files = readdirSync(knowledgePath).filter((f: string) => f.endsWith('.json'));
    
    if (files.length === 0) {
      console.log(chalk.yellow('No knowledge entries found.'));
      return;
    }

    console.log(chalk.blue(`\nKnowledge Entries (${files.length}):\n`));
    
    files.forEach((file: string) => {
      const entry = JSON.parse(readFileSync(join(knowledgePath, file), 'utf-8'));
      const typeColor = entry.type === 'code' ? chalk.green : 
                       entry.type === 'decision' ? chalk.yellow : 
                       chalk.gray;
      console.log(`${typeColor(entry.type)} - ${entry.title}`);
      if (entry.tags && entry.tags.length > 0) {
        console.log(chalk.gray(`  Tags: ${entry.tags.join(', ')}`));
      }
      console.log();
    });
  });

program
  .command('stats')
  .description('Show DevKB statistics')
  .action(() => {
    const config = getConfig();
    const dataDir = join(process.cwd(), config.dataDir);
    
    if (!existsSync(dataDir)) {
      console.log(chalk.yellow('DevKB not initialized. Run "devkb init" first.'));
      return;
    }

    const indexPath = join(dataDir, 'index', 'files.json');
    const knowledgePath = join(dataDir, 'knowledge');
    
    let indexedFiles = 0;
    let knowledgeEntries = 0;

    if (existsSync(indexPath)) {
      const indexData = JSON.parse(readFileSync(indexPath, 'utf-8'));
      indexedFiles = indexData.length;
    }

    if (existsSync(knowledgePath)) {
      const { readdirSync } = require('fs');
      const dirFiles = readdirSync(knowledgePath);
      knowledgeEntries = dirFiles.filter((f: string) => f.endsWith('.json')).length;
    }

    console.log(chalk.blue('\n📊 DevKB Statistics\n'));
    console.log(chalk.gray('Indexed files:     ') + chalk.white(indexedFiles));
    console.log(chalk.gray('Knowledge entries: ') + chalk.white(knowledgeEntries));
    console.log(chalk.gray('Data directory:    ') + chalk.white(config.dataDir));
    console.log();
  });

program.parse();
