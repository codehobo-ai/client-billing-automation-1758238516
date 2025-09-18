#!/usr/bin/env node

const fs = require('fs');

function parseIssueBody(issueBody) {
  const lines = issueBody.split('\n');
  const data = {};

  lines.forEach(line => {
    const trimmed = line.trim();

    if (trimmed.includes('Client Name:') || trimmed.includes('Client:')) {
      data.clientName = trimmed.split(':')[1].trim();
    }

    if (trimmed.includes('Billing Type:') || trimmed.includes('Billing:')) {
      const billing = trimmed.split(':')[1].trim().toLowerCase();
      if (['monthly', 'quarterly', 'annual'].includes(billing)) {
        data.billingType = billing;
      }
    }

    if (trimmed.includes('Tier:') || trimmed.includes('Service Tier:')) {
      const tier = trimmed.split(':')[1].trim().toLowerCase();
      if (['basic', 'standard', 'premium', 'enterprise'].includes(tier)) {
        data.tier = tier;
      }
    }
  });

  if (!data.clientName || !data.billingType || !data.tier) {
    console.error('Failed to parse all required information from issue body');
    console.error('Parsed data:', data);
    process.exit(1);
  }

  const branchName = data.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  console.log(`::set-output name=CLIENT_NAME::${data.clientName}`);
  console.log(`::set-output name=BILLING_TYPE::${data.billingType}`);
  console.log(`::set-output name=TIER::${data.tier}`);
  console.log(`::set-output name=BRANCH_NAME::${branchName}`);

  return data;
}

if (require.main === module) {
  const issueBody = process.argv[2];

  if (!issueBody) {
    console.error('Error: Issue body not provided');
    process.exit(1);
  }

  parseIssueBody(issueBody);
}

module.exports = { parseIssueBody };