import { z } from "zod";

const strArray = z.array(z.string().trim().min(1)).default([]);

export const investorInput = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const criteriaInput = z.object({
  label: z.string().trim().min(1).default("Primary"),
  states: strArray,
  counties: strArray,
  zips: strArray,
  propertyTypes: strArray,
  minPrice: z.number().int().nonnegative().nullable().optional(),
  maxPrice: z.number().int().nonnegative().nullable().optional(),
  minBeds: z.number().int().nonnegative().nullable().optional(),
  minBaths: z.number().nonnegative().nullable().optional(),
  minSqft: z.number().int().nonnegative().nullable().optional(),
  minEquityPct: z.number().min(0).max(100).nullable().optional(),
  distressTypes: strArray,
  rehabAppetite: z.enum(["light", "medium", "heavy", "any"]).nullable().optional(),
});

export const investorWithCriteriaInput = z.object({
  investor: investorInput,
  criteria: criteriaInput,
});

export type InvestorInput = z.infer<typeof investorInput>;
export type CriteriaInput = z.infer<typeof criteriaInput>;
