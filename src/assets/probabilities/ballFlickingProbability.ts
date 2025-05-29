import json150 from './2025알까기/150.json';
import json500 from './2025알까기/750.json';
import json2500R from './2025알까기/750.json';
import jsonLegend from './2025알까기/Legend.json';
import GradeProbability from "@/constant/GradeProbability";
import JsonProbability from "@/constant/JsonProbability";


const ballFlickingProbability: GradeProbability = {
    '150': json150 as JsonProbability,
    '750': json500 as JsonProbability,
    '2500R': json2500R as JsonProbability,
    'Legend': jsonLegend as JsonProbability
}

export default ballFlickingProbability;