// lib/planDetails.ts

export interface Plan {
    priceId: string;
    planName: string;
    tokens: number;
    credits: number;
    freeCredits: number;
    price: number;
  }
  
  export const planDetails: Plan[] = [
    {
      priceId: 'price_1PtYXeE4H116aDHAFyye0Pov', // real price_1PtYXeE4H116aDHAFyye0Pov
      planName: 'Omni Starter',
      tokens: 10000,
      credits: 250,
      freeCredits: 20,
      price: 20.00,

    },
    {
      priceId: 'price_1PtYXeE4H116aDHA2gg2r8yK',
      planName: 'Omni Quantum',
      tokens: 500000,
      credits: 400,
      freeCredits: 100,
      price: 50.00,

    },
    {
      priceId: 'price_1PtYXeE4H116aDHABZTcpQdo', // Ensure unique priceId for different plans
      planName: 'Omni Enterprise Steller',
      tokens: 2000000, // Unlimited
      credits: 14500,
      freeCredits: 600,
      price: 250.00,

    },
  ];
  
