import json150 from './2026포교된도시의밤/150.json';
import json750 from './2026포교된도시의밤/750.json';
import json2500R from './2026포교된도시의밤/2500R.json';
import jsonLegend from './2026포교된도시의밤/Legend.json';
import GradeProbability from "@/constant/GradeProbability";
import JsonProbability from "@/constant/JsonProbability";

const cityNight2026Probability: GradeProbability = {
  '150': json150 as JsonProbability,
  '750': json750 as JsonProbability,
  '2500R': json2500R as JsonProbability,
  'Legend': jsonLegend as JsonProbability
};

export default cityNight2026Probability;
