// domain-templates.js — Industry-specific domain/capability templates
// Each template provides a set of domains with L1 capabilities and L2 sub-capabilities

export const domainTemplates = [
  {
    id: 'manufacturing',
    labelKey: 'template.manufacturing.label',
    descKey: 'template.manufacturing.desc',
    icon: 'cog',
    domains: [
      {
        id: 1, name: 'IT Infrastructure & Operations', color: '#3B82F6', icon: 'server',
        description: 'Foundation of all IT services', domainOwner: 'CIO',
        strategicFocus: 'Stability, Hybrid Cloud, Cost Efficiency',
        kpis: [], capabilities: [
          { id: '1.1', name: 'Datacenter Management', maturity: 3, targetMaturity: 3, criticality: 'High', subCapabilities: [
            { id: '1.1.1', name: 'Server & Compute Management' }, { id: '1.1.2', name: 'Storage Management' }
          ]},
          { id: '1.2', name: 'Cloud Platform Management', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '1.2.1', name: 'IaaS Management' }, { id: '1.2.2', name: 'PaaS Management' }
          ]},
          { id: '1.3', name: 'IT Security & Compliance', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '1.3.1', name: 'Identity & Access Management' }, { id: '1.3.2', name: 'Network Security' }
          ]},
          { id: '1.4', name: 'IT Service Management', maturity: 3, targetMaturity: 4, criticality: 'Medium', subCapabilities: [
            { id: '1.4.1', name: 'Incident Management' }, { id: '1.4.2', name: 'Change Management' }
          ]}
        ]
      },
      {
        id: 2, name: 'Digital Workplace & Collaboration', color: '#8B5CF6', icon: 'users',
        description: 'Modern workplace tools and collaboration', domainOwner: 'CIO',
        strategicFocus: 'Employee Productivity, Modern Workplace',
        kpis: [], capabilities: [
          { id: '2.1', name: 'Modern Workplace', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '2.1.1', name: 'Unified Communications' }, { id: '2.1.2', name: 'Endpoint Management' }
          ]},
          { id: '2.2', name: 'Collaboration & Content Management', maturity: 2, targetMaturity: 4, criticality: 'Medium', subCapabilities: [
            { id: '2.2.1', name: 'Document Management' }, { id: '2.2.2', name: 'Team Collaboration' }
          ]}
        ]
      },
      {
        id: 3, name: 'Sales & Customer Management', color: '#10B981', icon: 'chart-bar',
        description: 'CRM and sales processes', domainOwner: 'CSO',
        strategicFocus: 'Customer Experience, 360° View',
        kpis: [], capabilities: [
          { id: '3.1', name: 'CRM', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '3.1.1', name: 'Lead Management' }, { id: '3.1.2', name: 'Opportunity Management' }
          ]},
          { id: '3.2', name: 'Customer Service', maturity: 2, targetMaturity: 3, criticality: 'Medium', subCapabilities: [
            { id: '3.2.1', name: 'Service Desk' }, { id: '3.2.2', name: 'Field Service' }
          ]}
        ]
      },
      {
        id: 4, name: 'Production & Manufacturing', color: '#F59E0B', icon: 'cog',
        description: 'Manufacturing execution and production planning', domainOwner: 'COO',
        strategicFocus: 'Industry 4.0, Smart Factory',
        kpis: [], capabilities: [
          { id: '4.1', name: 'Production Planning (PPS)', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '4.1.1', name: 'Capacity Planning' }, { id: '4.1.2', name: 'Material Requirements Planning' }
          ]},
          { id: '4.2', name: 'Manufacturing Execution (MES)', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '4.2.1', name: 'Shop Floor Control' }, { id: '4.2.2', name: 'Production Monitoring' }
          ]},
          { id: '4.3', name: 'Quality Management', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '4.3.1', name: 'Incoming Inspection' }, { id: '4.3.2', name: 'Statistical Process Control' }
          ]},
          { id: '4.4', name: 'Maintenance & Asset Management', maturity: 2, targetMaturity: 3, criticality: 'Medium', subCapabilities: [
            { id: '4.4.1', name: 'Preventive Maintenance' }, { id: '4.4.2', name: 'Predictive Maintenance' }
          ]}
        ]
      },
      {
        id: 5, name: 'Supply Chain & Logistics', color: '#EF4444', icon: 'truck',
        description: 'End-to-end supply chain management', domainOwner: 'COO',
        strategicFocus: 'Supply Chain Resilience, Visibility',
        kpis: [], capabilities: [
          { id: '5.1', name: 'Procurement', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '5.1.1', name: 'Strategic Sourcing' }, { id: '5.1.2', name: 'Purchase Order Management' }
          ]},
          { id: '5.2', name: 'Warehouse Management', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '5.2.1', name: 'Inventory Management' }, { id: '5.2.2', name: 'Shipping & Receiving' }
          ]},
          { id: '5.3', name: 'Transport Management', maturity: 2, targetMaturity: 3, criticality: 'Medium', subCapabilities: [
            { id: '5.3.1', name: 'Route Planning' }, { id: '5.3.2', name: 'Fleet Management' }
          ]}
        ]
      },
      {
        id: 6, name: 'Engineering & Product Development', color: '#6366F1', icon: 'pencil',
        description: 'Product lifecycle and engineering', domainOwner: 'CTO',
        strategicFocus: 'Digital Twin, PLM Integration',
        kpis: [], capabilities: [
          { id: '6.1', name: 'Product Lifecycle Management (PLM)', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '6.1.1', name: 'CAD/CAM Management' }, { id: '6.1.2', name: 'Bill of Materials' }
          ]},
          { id: '6.2', name: 'R&D Management', maturity: 2, targetMaturity: 3, criticality: 'Medium', subCapabilities: [
            { id: '6.2.1', name: 'Innovation Pipeline' }, { id: '6.2.2', name: 'Prototyping' }
          ]}
        ]
      },
      {
        id: 7, name: 'Finance & Controlling', color: '#14B8A6', icon: 'currency-dollar',
        description: 'Financial management and controlling', domainOwner: 'CFO',
        strategicFocus: 'Automation, Real-time Reporting',
        kpis: [], capabilities: [
          { id: '7.1', name: 'Financial Accounting', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '7.1.1', name: 'General Ledger' }, { id: '7.1.2', name: 'Accounts Payable/Receivable' }
          ]},
          { id: '7.2', name: 'Controlling & Reporting', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '7.2.1', name: 'Cost Center Accounting' }, { id: '7.2.2', name: 'Management Reporting' }
          ]}
        ]
      },
      {
        id: 8, name: 'HR & Organisation', color: '#EC4899', icon: 'user-group',
        description: 'Human resources and organizational management', domainOwner: 'CHRO',
        strategicFocus: 'Employee Experience, Talent Management',
        kpis: [], capabilities: [
          { id: '8.1', name: 'Core HR', maturity: 3, targetMaturity: 3, criticality: 'High', subCapabilities: [
            { id: '8.1.1', name: 'Payroll' }, { id: '8.1.2', name: 'Time & Attendance' }
          ]},
          { id: '8.2', name: 'Talent Management', maturity: 2, targetMaturity: 3, criticality: 'Medium', subCapabilities: [
            { id: '8.2.1', name: 'Recruiting' }, { id: '8.2.2', name: 'Learning & Development' }
          ]}
        ]
      },
      {
        id: 9, name: 'Data & Analytics', color: '#F97316', icon: 'presentation-chart-bar',
        description: 'Enterprise data platform and analytics', domainOwner: 'CDO',
        strategicFocus: 'Data-driven Decisions, AI/ML',
        kpis: [], capabilities: [
          { id: '9.1', name: 'Data Platform', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '9.1.1', name: 'Data Warehouse' }, { id: '9.1.2', name: 'Data Lake' }
          ]},
          { id: '9.2', name: 'Business Intelligence', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '9.2.1', name: 'Dashboards & Reporting' }, { id: '9.2.2', name: 'Self-Service Analytics' }
          ]}
        ]
      }
    ]
  },

  {
    id: 'financial-services',
    labelKey: 'template.financial.label',
    descKey: 'template.financial.desc',
    icon: 'currency-dollar',
    domains: [
      {
        id: 1, name: 'Core Banking', color: '#3B82F6', icon: 'building-library',
        description: 'Core banking systems and account management', domainOwner: 'COO',
        strategicFocus: 'Core Modernization, Open Banking',
        kpis: [], capabilities: [
          { id: '1.1', name: 'Account Management', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '1.1.1', name: 'Deposit Accounts' }, { id: '1.1.2', name: 'Loan Accounts' }
          ]},
          { id: '1.2', name: 'Payment Processing', maturity: 3, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '1.2.1', name: 'Domestic Payments' }, { id: '1.2.2', name: 'International Payments' }
          ]},
          { id: '1.3', name: 'Lending & Credit', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '1.3.1', name: 'Credit Origination' }, { id: '1.3.2', name: 'Credit Scoring' }
          ]}
        ]
      },
      {
        id: 2, name: 'Risk & Compliance', color: '#EF4444', icon: 'shield-check',
        description: 'Risk management and regulatory compliance', domainOwner: 'CRO',
        strategicFocus: 'RegTech, Real-time Risk Monitoring',
        kpis: [], capabilities: [
          { id: '2.1', name: 'Risk Management', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '2.1.1', name: 'Market Risk' }, { id: '2.1.2', name: 'Credit Risk' }, { id: '2.1.3', name: 'Operational Risk' }
          ]},
          { id: '2.2', name: 'Regulatory Reporting', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '2.2.1', name: 'Basel III/IV Reporting' }, { id: '2.2.2', name: 'AML/KYC' }
          ]},
          { id: '2.3', name: 'Fraud Detection', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '2.3.1', name: 'Transaction Monitoring' }, { id: '2.3.2', name: 'Identity Verification' }
          ]}
        ]
      },
      {
        id: 3, name: 'Digital Banking & Channels', color: '#8B5CF6', icon: 'device-mobile',
        description: 'Digital customer-facing channels', domainOwner: 'CDO',
        strategicFocus: 'Digital-First, Omnichannel Experience',
        kpis: [], capabilities: [
          { id: '3.1', name: 'Online Banking', maturity: 3, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '3.1.1', name: 'Web Portal' }, { id: '3.1.2', name: 'Mobile Banking' }
          ]},
          { id: '3.2', name: 'Digital Onboarding', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '3.2.1', name: 'eKYC' }, { id: '3.2.2', name: 'Digital Signatures' }
          ]}
        ]
      },
      {
        id: 4, name: 'Wealth & Asset Management', color: '#10B981', icon: 'chart-bar',
        description: 'Investment and wealth management', domainOwner: 'Head of Wealth',
        strategicFocus: 'Robo-Advisory, Personalization',
        kpis: [], capabilities: [
          { id: '4.1', name: 'Portfolio Management', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '4.1.1', name: 'Asset Allocation' }, { id: '4.1.2', name: 'Performance Reporting' }
          ]},
          { id: '4.2', name: 'Trading & Execution', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '4.2.1', name: 'Order Management' }, { id: '4.2.2', name: 'Settlement' }
          ]}
        ]
      },
      {
        id: 5, name: 'Insurance Operations', color: '#F59E0B', icon: 'shield-check',
        description: 'Insurance product management and claims', domainOwner: 'COO Insurance',
        strategicFocus: 'InsurTech, Straight-Through Processing',
        kpis: [], capabilities: [
          { id: '5.1', name: 'Policy Administration', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '5.1.1', name: 'Policy Issuance' }, { id: '5.1.2', name: 'Endorsements' }
          ]},
          { id: '5.2', name: 'Claims Management', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '5.2.1', name: 'Claims Processing' }, { id: '5.2.2', name: 'Claims Assessment' }
          ]}
        ]
      },
      {
        id: 6, name: 'Finance & Controlling', color: '#14B8A6', icon: 'currency-dollar',
        description: 'Financial management and controlling', domainOwner: 'CFO',
        strategicFocus: 'Automation, Real-time Reporting',
        kpis: [], capabilities: [
          { id: '6.1', name: 'Financial Accounting', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '6.1.1', name: 'General Ledger' }, { id: '6.1.2', name: 'Accounts Payable/Receivable' }
          ]},
          { id: '6.2', name: 'Treasury', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '6.2.1', name: 'Cash Management' }, { id: '6.2.2', name: 'Liquidity Planning' }
          ]}
        ]
      },
      {
        id: 7, name: 'IT Infrastructure & Security', color: '#6366F1', icon: 'server',
        description: 'IT infrastructure and cybersecurity', domainOwner: 'CIO',
        strategicFocus: 'Cloud Adoption, Zero Trust Security',
        kpis: [], capabilities: [
          { id: '7.1', name: 'Cloud & Infrastructure', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '7.1.1', name: 'Cloud Platform' }, { id: '7.1.2', name: 'Network Infrastructure' }
          ]},
          { id: '7.2', name: 'Cybersecurity', maturity: 3, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '7.2.1', name: 'SOC & SIEM' }, { id: '7.2.2', name: 'Identity & Access Management' }
          ]}
        ]
      },
      {
        id: 8, name: 'Data & Analytics', color: '#F97316', icon: 'presentation-chart-bar',
        description: 'Enterprise data platform and analytics', domainOwner: 'CDO',
        strategicFocus: 'Data-driven Decisions, AI/ML',
        kpis: [], capabilities: [
          { id: '8.1', name: 'Data Platform', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '8.1.1', name: 'Data Warehouse' }, { id: '8.1.2', name: 'Data Lake' }
          ]},
          { id: '8.2', name: 'Advanced Analytics', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '8.2.1', name: 'Predictive Analytics' }, { id: '8.2.2', name: 'AI/ML Platform' }
          ]}
        ]
      }
    ]
  },

  {
    id: 'healthcare',
    labelKey: 'template.healthcare.label',
    descKey: 'template.healthcare.desc',
    icon: 'heart',
    domains: [
      {
        id: 1, name: 'Clinical Systems', color: '#EF4444', icon: 'heart',
        description: 'Core clinical IT systems', domainOwner: 'CMIO',
        strategicFocus: 'EHR Optimization, Clinical Decision Support',
        kpis: [], capabilities: [
          { id: '1.1', name: 'Electronic Health Records (EHR)', maturity: 3, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '1.1.1', name: 'Patient Charting' }, { id: '1.1.2', name: 'Clinical Documentation' }
          ]},
          { id: '1.2', name: 'Clinical Decision Support', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '1.2.1', name: 'Drug Interaction Alerts' }, { id: '1.2.2', name: 'Care Pathways' }
          ]},
          { id: '1.3', name: 'Laboratory Information Systems', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '1.3.1', name: 'Lab Order Management' }, { id: '1.3.2', name: 'Results Reporting' }
          ]}
        ]
      },
      {
        id: 2, name: 'Patient Management', color: '#3B82F6', icon: 'users',
        description: 'Patient administration and scheduling', domainOwner: 'COO',
        strategicFocus: 'Patient Experience, Digital Front Door',
        kpis: [], capabilities: [
          { id: '2.1', name: 'Patient Registration & ADT', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '2.1.1', name: 'Admission/Discharge/Transfer' }, { id: '2.1.2', name: 'Patient Identity Management' }
          ]},
          { id: '2.2', name: 'Scheduling', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '2.2.1', name: 'Appointment Scheduling' }, { id: '2.2.2', name: 'Resource Scheduling' }
          ]},
          { id: '2.3', name: 'Patient Portal', maturity: 2, targetMaturity: 4, criticality: 'Medium', subCapabilities: [
            { id: '2.3.1', name: 'Online Booking' }, { id: '2.3.2', name: 'Patient Communication' }
          ]}
        ]
      },
      {
        id: 3, name: 'Medical Imaging & Diagnostics', color: '#8B5CF6', icon: 'camera',
        description: 'Imaging and diagnostic systems', domainOwner: 'Head of Radiology',
        strategicFocus: 'AI-assisted Diagnostics, PACS Modernization',
        kpis: [], capabilities: [
          { id: '3.1', name: 'PACS / Imaging', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '3.1.1', name: 'Image Storage & Archiving' }, { id: '3.1.2', name: 'Image Viewing & Reporting' }
          ]},
          { id: '3.2', name: 'Diagnostic Workflows', maturity: 2, targetMaturity: 4, criticality: 'Medium', subCapabilities: [
            { id: '3.2.1', name: 'AI-assisted Diagnosis' }, { id: '3.2.2', name: 'Pathology Systems' }
          ]}
        ]
      },
      {
        id: 4, name: 'Pharmacy & Medication', color: '#10B981', icon: 'beaker',
        description: 'Pharmacy and medication management', domainOwner: 'Chief Pharmacist',
        strategicFocus: 'Medication Safety, Closed-Loop',
        kpis: [], capabilities: [
          { id: '4.1', name: 'Pharmacy Management', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '4.1.1', name: 'Drug Dispensing' }, { id: '4.1.2', name: 'Formulary Management' }
          ]},
          { id: '4.2', name: 'Medication Administration', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '4.2.1', name: 'ePrescribing' }, { id: '4.2.2', name: 'Barcode Verification' }
          ]}
        ]
      },
      {
        id: 5, name: 'Revenue Cycle & Billing', color: '#F59E0B', icon: 'currency-dollar',
        description: 'Revenue cycle management', domainOwner: 'CFO',
        strategicFocus: 'Revenue Optimization, Denial Management',
        kpis: [], capabilities: [
          { id: '5.1', name: 'Billing & Coding', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '5.1.1', name: 'Charge Capture' }, { id: '5.1.2', name: 'Claims Submission' }
          ]},
          { id: '5.2', name: 'Insurance & Payer Management', maturity: 2, targetMaturity: 3, criticality: 'Medium', subCapabilities: [
            { id: '5.2.1', name: 'Eligibility Verification' }, { id: '5.2.2', name: 'Prior Authorization' }
          ]}
        ]
      },
      {
        id: 6, name: 'Healthcare Analytics & Research', color: '#14B8A6', icon: 'presentation-chart-bar',
        description: 'Clinical analytics and research', domainOwner: 'CDO',
        strategicFocus: 'Population Health, Clinical Research',
        kpis: [], capabilities: [
          { id: '6.1', name: 'Clinical Analytics', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '6.1.1', name: 'Quality Metrics' }, { id: '6.1.2', name: 'Population Health' }
          ]},
          { id: '6.2', name: 'Research Data Management', maturity: 1, targetMaturity: 3, criticality: 'Medium', subCapabilities: [
            { id: '6.2.1', name: 'Clinical Trials' }, { id: '6.2.2', name: 'Biobank Management' }
          ]}
        ]
      },
      {
        id: 7, name: 'IT Infrastructure & Security', color: '#6366F1', icon: 'server',
        description: 'IT infrastructure and data security', domainOwner: 'CIO',
        strategicFocus: 'HIPAA Compliance, Interoperability',
        kpis: [], capabilities: [
          { id: '7.1', name: 'Health IT Infrastructure', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '7.1.1', name: 'Network & Connectivity' }, { id: '7.1.2', name: 'Cloud Platform' }
          ]},
          { id: '7.2', name: 'Health Data Security', maturity: 3, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '7.2.1', name: 'Patient Data Privacy' }, { id: '7.2.2', name: 'Access Control' }
          ]},
          { id: '7.3', name: 'Interoperability', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '7.3.1', name: 'HL7/FHIR Integration' }, { id: '7.3.2', name: 'Health Information Exchange' }
          ]}
        ]
      }
    ]
  },

  {
    id: 'retail',
    labelKey: 'template.retail.label',
    descKey: 'template.retail.desc',
    icon: 'shopping-cart',
    domains: [
      {
        id: 1, name: 'Commerce & Sales Channels', color: '#3B82F6', icon: 'shopping-cart',
        description: 'E-commerce and omnichannel sales', domainOwner: 'Chief Commercial Officer',
        strategicFocus: 'Omnichannel, Unified Commerce',
        kpis: [], capabilities: [
          { id: '1.1', name: 'E-Commerce Platform', maturity: 3, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '1.1.1', name: 'Product Catalog' }, { id: '1.1.2', name: 'Shopping Cart & Checkout' }
          ]},
          { id: '1.2', name: 'Point of Sale (POS)', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '1.2.1', name: 'In-store POS' }, { id: '1.2.2', name: 'Mobile POS' }
          ]},
          { id: '1.3', name: 'Marketplace Integration', maturity: 2, targetMaturity: 4, criticality: 'Medium', subCapabilities: [
            { id: '1.3.1', name: 'Third-party Marketplaces' }, { id: '1.3.2', name: 'Social Commerce' }
          ]}
        ]
      },
      {
        id: 2, name: 'Customer Experience & Marketing', color: '#8B5CF6', icon: 'users',
        description: 'Customer engagement and marketing', domainOwner: 'CMO',
        strategicFocus: 'Personalization, Customer Loyalty',
        kpis: [], capabilities: [
          { id: '2.1', name: 'Customer Data Platform', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '2.1.1', name: 'Customer 360° View' }, { id: '2.1.2', name: 'Segmentation' }
          ]},
          { id: '2.2', name: 'Marketing Automation', maturity: 2, targetMaturity: 4, criticality: 'Medium', subCapabilities: [
            { id: '2.2.1', name: 'Campaign Management' }, { id: '2.2.2', name: 'Email Marketing' }
          ]},
          { id: '2.3', name: 'Loyalty & Rewards', maturity: 2, targetMaturity: 4, criticality: 'Medium', subCapabilities: [
            { id: '2.3.1', name: 'Loyalty Programs' }, { id: '2.3.2', name: 'Promotions Engine' }
          ]}
        ]
      },
      {
        id: 3, name: 'Supply Chain & Logistics', color: '#EF4444', icon: 'truck',
        description: 'Supply chain and fulfillment', domainOwner: 'COO',
        strategicFocus: 'Fulfillment Speed, Supply Chain Visibility',
        kpis: [], capabilities: [
          { id: '3.1', name: 'Order Management', maturity: 3, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '3.1.1', name: 'Order Orchestration' }, { id: '3.1.2', name: 'Returns Management' }
          ]},
          { id: '3.2', name: 'Inventory Management', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '3.2.1', name: 'Stock Management' }, { id: '3.2.2', name: 'Demand Forecasting' }
          ]},
          { id: '3.3', name: 'Warehouse & Fulfillment', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '3.3.1', name: 'Warehouse Management' }, { id: '3.3.2', name: 'Last Mile Delivery' }
          ]}
        ]
      },
      {
        id: 4, name: 'Merchandising & Pricing', color: '#F59E0B', icon: 'tag',
        description: 'Merchandising, assortment, and pricing', domainOwner: 'Head of Merchandising',
        strategicFocus: 'Dynamic Pricing, AI-driven Assortment',
        kpis: [], capabilities: [
          { id: '4.1', name: 'Assortment Planning', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '4.1.1', name: 'Category Management' }, { id: '4.1.2', name: 'Space Planning' }
          ]},
          { id: '4.2', name: 'Pricing & Promotions', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '4.2.1', name: 'Price Optimization' }, { id: '4.2.2', name: 'Promotion Management' }
          ]}
        ]
      },
      {
        id: 5, name: 'Store Operations', color: '#10B981', icon: 'building-storefront',
        description: 'Physical store operations', domainOwner: 'VP Retail Operations',
        strategicFocus: 'Smart Store, Employee Enablement',
        kpis: [], capabilities: [
          { id: '5.1', name: 'Store Management', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '5.1.1', name: 'Store Task Management' }, { id: '5.1.2', name: 'Staff Scheduling' }
          ]},
          { id: '5.2', name: 'In-Store Technology', maturity: 2, targetMaturity: 4, criticality: 'Medium', subCapabilities: [
            { id: '5.2.1', name: 'Self-Checkout' }, { id: '5.2.2', name: 'Digital Signage' }
          ]}
        ]
      },
      {
        id: 6, name: 'Finance & Administration', color: '#14B8A6', icon: 'currency-dollar',
        description: 'Financial management and administration', domainOwner: 'CFO',
        strategicFocus: 'Automation, Real-time Reporting',
        kpis: [], capabilities: [
          { id: '6.1', name: 'Financial Management', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '6.1.1', name: 'General Ledger' }, { id: '6.1.2', name: 'Accounts Payable/Receivable' }
          ]},
          { id: '6.2', name: 'Payment Processing', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '6.2.1', name: 'Payment Gateway' }, { id: '6.2.2', name: 'Payment Reconciliation' }
          ]}
        ]
      },
      {
        id: 7, name: 'Data & Analytics', color: '#F97316', icon: 'presentation-chart-bar',
        description: 'Retail analytics and data platform', domainOwner: 'CDO',
        strategicFocus: 'Customer Analytics, AI/ML',
        kpis: [], capabilities: [
          { id: '7.1', name: 'Retail Analytics', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '7.1.1', name: 'Sales Analytics' }, { id: '7.1.2', name: 'Customer Analytics' }
          ]},
          { id: '7.2', name: 'Data Platform', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '7.2.1', name: 'Data Warehouse' }, { id: '7.2.2', name: 'Real-time Event Processing' }
          ]}
        ]
      },
      {
        id: 8, name: 'IT Infrastructure', color: '#6366F1', icon: 'server',
        description: 'IT infrastructure and platform services', domainOwner: 'CIO',
        strategicFocus: 'Cloud-native, API-first',
        kpis: [], capabilities: [
          { id: '8.1', name: 'Cloud & Infrastructure', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '8.1.1', name: 'Cloud Platform' }, { id: '8.1.2', name: 'CDN & Edge' }
          ]},
          { id: '8.2', name: 'API & Integration', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '8.2.1', name: 'API Gateway' }, { id: '8.2.2', name: 'Integration Platform' }
          ]}
        ]
      }
    ]
  },

  {
    id: 'technology',
    labelKey: 'template.technology.label',
    descKey: 'template.technology.desc',
    icon: 'cpu-chip',
    domains: [
      {
        id: 1, name: 'Product Engineering', color: '#3B82F6', icon: 'code-bracket',
        description: 'Software product development and engineering', domainOwner: 'VP Engineering',
        strategicFocus: 'Developer Experience, CI/CD, Platform Engineering',
        kpis: [], capabilities: [
          { id: '1.1', name: 'Software Development', maturity: 3, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '1.1.1', name: 'Source Code Management' }, { id: '1.1.2', name: 'Code Review & Quality' }
          ]},
          { id: '1.2', name: 'CI/CD & DevOps', maturity: 3, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '1.2.1', name: 'Build & Deploy Pipelines' }, { id: '1.2.2', name: 'Infrastructure as Code' }
          ]},
          { id: '1.3', name: 'Quality Assurance', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '1.3.1', name: 'Test Automation' }, { id: '1.3.2', name: 'Performance Testing' }
          ]}
        ]
      },
      {
        id: 2, name: 'Cloud Platform & Infrastructure', color: '#8B5CF6', icon: 'cloud',
        description: 'Cloud infrastructure and platform services', domainOwner: 'VP Infrastructure',
        strategicFocus: 'Cloud-native, Scalability, Reliability',
        kpis: [], capabilities: [
          { id: '2.1', name: 'Cloud Infrastructure', maturity: 3, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '2.1.1', name: 'Compute & Containers' }, { id: '2.1.2', name: 'Networking & CDN' }
          ]},
          { id: '2.2', name: 'Platform Services', maturity: 3, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '2.2.1', name: 'Databases & Storage' }, { id: '2.2.2', name: 'Message Queues & Streaming' }
          ]},
          { id: '2.3', name: 'Observability', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '2.3.1', name: 'Monitoring & Alerting' }, { id: '2.3.2', name: 'Logging & Tracing' }
          ]}
        ]
      },
      {
        id: 3, name: 'Security & Trust', color: '#EF4444', icon: 'shield-check',
        description: 'Security, privacy, and trust', domainOwner: 'CISO',
        strategicFocus: 'Zero Trust, DevSecOps',
        kpis: [], capabilities: [
          { id: '3.1', name: 'Application Security', maturity: 3, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '3.1.1', name: 'SAST/DAST' }, { id: '3.1.2', name: 'Vulnerability Management' }
          ]},
          { id: '3.2', name: 'Identity & Access', maturity: 3, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '3.2.1', name: 'SSO & MFA' }, { id: '3.2.2', name: 'Authorization & RBAC' }
          ]},
          { id: '3.3', name: 'Data Privacy', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '3.3.1', name: 'Data Classification' }, { id: '3.3.2', name: 'Privacy Controls' }
          ]}
        ]
      },
      {
        id: 4, name: 'Product Management', color: '#10B981', icon: 'light-bulb',
        description: 'Product strategy and management', domainOwner: 'VP Product',
        strategicFocus: 'Product-led Growth, Data-driven Decisions',
        kpis: [], capabilities: [
          { id: '4.1', name: 'Product Analytics', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '4.1.1', name: 'Usage Analytics' }, { id: '4.1.2', name: 'A/B Testing' }
          ]},
          { id: '4.2', name: 'Feature Management', maturity: 2, targetMaturity: 4, criticality: 'Medium', subCapabilities: [
            { id: '4.2.1', name: 'Feature Flags' }, { id: '4.2.2', name: 'Release Management' }
          ]}
        ]
      },
      {
        id: 5, name: 'Data & AI', color: '#F59E0B', icon: 'presentation-chart-bar',
        description: 'Data engineering, analytics, and AI/ML', domainOwner: 'VP Data',
        strategicFocus: 'Data Mesh, MLOps, GenAI',
        kpis: [], capabilities: [
          { id: '5.1', name: 'Data Engineering', maturity: 3, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '5.1.1', name: 'Data Pipelines' }, { id: '5.1.2', name: 'Data Quality' }
          ]},
          { id: '5.2', name: 'Machine Learning', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '5.2.1', name: 'ML Platform' }, { id: '5.2.2', name: 'Model Serving' }
          ]},
          { id: '5.3', name: 'Business Intelligence', maturity: 3, targetMaturity: 4, criticality: 'Medium', subCapabilities: [
            { id: '5.3.1', name: 'Dashboards & Reporting' }, { id: '5.3.2', name: 'Self-Service Analytics' }
          ]}
        ]
      },
      {
        id: 6, name: 'Customer Success & Support', color: '#EC4899', icon: 'chat-bubble-left-right',
        description: 'Customer support and success tools', domainOwner: 'VP Customer Success',
        strategicFocus: 'Self-Service, Proactive Support',
        kpis: [], capabilities: [
          { id: '6.1', name: 'Support Platform', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '6.1.1', name: 'Ticketing System' }, { id: '6.1.2', name: 'Knowledge Base' }
          ]},
          { id: '6.2', name: 'Customer Success', maturity: 2, targetMaturity: 4, criticality: 'Medium', subCapabilities: [
            { id: '6.2.1', name: 'Health Scoring' }, { id: '6.2.2', name: 'Onboarding' }
          ]}
        ]
      },
      {
        id: 7, name: 'Go-to-Market & Revenue', color: '#14B8A6', icon: 'chart-bar',
        description: 'Sales, marketing, and revenue operations', domainOwner: 'CRO',
        strategicFocus: 'PLG + Sales-led, Revenue Operations',
        kpis: [], capabilities: [
          { id: '7.1', name: 'CRM & Sales', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '7.1.1', name: 'Pipeline Management' }, { id: '7.1.2', name: 'Sales Automation' }
          ]},
          { id: '7.2', name: 'Marketing Operations', maturity: 2, targetMaturity: 4, criticality: 'Medium', subCapabilities: [
            { id: '7.2.1', name: 'Marketing Automation' }, { id: '7.2.2', name: 'Content Management' }
          ]}
        ]
      },
      {
        id: 8, name: 'Corporate IT & Finance', color: '#6366F1', icon: 'building-office',
        description: 'Corporate IT and financial systems', domainOwner: 'CFO',
        strategicFocus: 'Automation, SaaS Optimization',
        kpis: [], capabilities: [
          { id: '8.1', name: 'Finance & Billing', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '8.1.1', name: 'Billing & Subscriptions' }, { id: '8.1.2', name: 'Financial Accounting' }
          ]},
          { id: '8.2', name: 'HR & People', maturity: 2, targetMaturity: 3, criticality: 'Medium', subCapabilities: [
            { id: '8.2.1', name: 'HRIS' }, { id: '8.2.2', name: 'Talent Management' }
          ]}
        ]
      }
    ]
  },

  {
    id: 'public-sector',
    labelKey: 'template.publicSector.label',
    descKey: 'template.publicSector.desc',
    icon: 'building-library',
    domains: [
      {
        id: 1, name: 'Citizen Services', color: '#3B82F6', icon: 'users',
        description: 'Digital citizen-facing services', domainOwner: 'Chief Digital Officer',
        strategicFocus: 'Digital Government, Citizen Experience',
        kpis: [], capabilities: [
          { id: '1.1', name: 'Citizen Portal', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '1.1.1', name: 'Online Services' }, { id: '1.1.2', name: 'Digital Identity' }
          ]},
          { id: '1.2', name: 'Case Management', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '1.2.1', name: 'Application Processing' }, { id: '1.2.2', name: 'Permit Management' }
          ]},
          { id: '1.3', name: 'Document Management', maturity: 2, targetMaturity: 4, criticality: 'Medium', subCapabilities: [
            { id: '1.3.1', name: 'Electronic Filing' }, { id: '1.3.2', name: 'Records Management' }
          ]}
        ]
      },
      {
        id: 2, name: 'Internal Administration', color: '#8B5CF6', icon: 'building-office',
        description: 'Internal government administration', domainOwner: 'Director of Administration',
        strategicFocus: 'Process Automation, Efficiency',
        kpis: [], capabilities: [
          { id: '2.1', name: 'Human Resource Management', maturity: 2, targetMaturity: 3, criticality: 'High', subCapabilities: [
            { id: '2.1.1', name: 'Personnel Management' }, { id: '2.1.2', name: 'Payroll' }
          ]},
          { id: '2.2', name: 'Procurement & Contracting', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '2.2.1', name: 'eProcurement' }, { id: '2.2.2', name: 'Contract Management' }
          ]}
        ]
      },
      {
        id: 3, name: 'Finance & Budget', color: '#10B981', icon: 'currency-dollar',
        description: 'Public finance and budget management', domainOwner: 'CFO',
        strategicFocus: 'Transparency, Digital Budgeting',
        kpis: [], capabilities: [
          { id: '3.1', name: 'Budget Management', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '3.1.1', name: 'Budget Planning' }, { id: '3.1.2', name: 'Budget Execution' }
          ]},
          { id: '3.2', name: 'Financial Accounting', maturity: 3, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '3.2.1', name: 'General Ledger' }, { id: '3.2.2', name: 'Accounts Payable' }
          ]},
          { id: '3.3', name: 'Tax & Revenue', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '3.3.1', name: 'Tax Collection' }, { id: '3.3.2', name: 'Revenue Management' }
          ]}
        ]
      },
      {
        id: 4, name: 'Public Safety & Emergency', color: '#EF4444', icon: 'shield-check',
        description: 'Public safety and emergency management', domainOwner: 'Director of Public Safety',
        strategicFocus: 'Interoperability, Real-time Response',
        kpis: [], capabilities: [
          { id: '4.1', name: 'Emergency Management', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '4.1.1', name: 'Incident Response' }, { id: '4.1.2', name: 'Resource Coordination' }
          ]},
          { id: '4.2', name: 'Public Safety Systems', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '4.2.1', name: 'Dispatch Systems' }, { id: '4.2.2', name: 'GIS & Mapping' }
          ]}
        ]
      },
      {
        id: 5, name: 'Infrastructure & Urban Planning', color: '#F59E0B', icon: 'map',
        description: 'Infrastructure and urban development', domainOwner: 'Director of Planning',
        strategicFocus: 'Smart City, Digital Planning',
        kpis: [], capabilities: [
          { id: '5.1', name: 'GIS & Geospatial', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '5.1.1', name: 'Spatial Data Management' }, { id: '5.1.2', name: 'Map Services' }
          ]},
          { id: '5.2', name: 'Asset Management', maturity: 2, targetMaturity: 3, criticality: 'Medium', subCapabilities: [
            { id: '5.2.1', name: 'Building Management' }, { id: '5.2.2', name: 'Infrastructure Maintenance' }
          ]}
        ]
      },
      {
        id: 6, name: 'Data & Analytics', color: '#14B8A6', icon: 'presentation-chart-bar',
        description: 'Open data and government analytics', domainOwner: 'CDO',
        strategicFocus: 'Open Data, Evidence-based Policy',
        kpis: [], capabilities: [
          { id: '6.1', name: 'Open Data Platform', maturity: 1, targetMaturity: 4, criticality: 'Medium', subCapabilities: [
            { id: '6.1.1', name: 'Data Catalog' }, { id: '6.1.2', name: 'Data Publishing' }
          ]},
          { id: '6.2', name: 'Government Analytics', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '6.2.1', name: 'Performance Dashboards' }, { id: '6.2.2', name: 'Predictive Analytics' }
          ]}
        ]
      },
      {
        id: 7, name: 'IT Infrastructure & Security', color: '#6366F1', icon: 'server',
        description: 'Government IT infrastructure', domainOwner: 'CIO',
        strategicFocus: 'Cloud-first, Cybersecurity',
        kpis: [], capabilities: [
          { id: '7.1', name: 'Government Cloud', maturity: 2, targetMaturity: 4, criticality: 'High', subCapabilities: [
            { id: '7.1.1', name: 'Cloud Platform' }, { id: '7.1.2', name: 'Shared Services' }
          ]},
          { id: '7.2', name: 'Cybersecurity', maturity: 2, targetMaturity: 5, criticality: 'High', subCapabilities: [
            { id: '7.2.1', name: 'Security Operations' }, { id: '7.2.2', name: 'Compliance Monitoring' }
          ]}
        ]
      }
    ]
  }
]
