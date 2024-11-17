export const g8ScoreMapping = {
  'Has food intake declined over the past 3 months due to loss of appetite, digestive problems, chewing or swallowing difficulties?':
    {
      'Severe decrease in food intake': 0,
      'Moderate decrease in food intake': 1,
      'No decrease in food intake': 2,
    },
  'Weight loss during the last 3 months': {
    'Weight loss > 3 kg': 0,
    'Does not know': 1,
    'Weight loss between 1 and 3 kgs': 2,
    'No weight loss': 3,
  },
  Mobility: {
    'Bed or chair bound': 0,
    'Able to get out of bed/chair but does not go out': 1,
    'Goes out': 2,
  },
  'Neuropsychological problems': {
    'Severe dementia or depression': 0,
    'Mild dementia or depression': 1,
    'No psychological problems': 2,
  },
  'Body Mass Index (BMI)': {
    'BMI < 19': 0,
    'BMI = 19 to BMI < 21': 1,
    'BMI = 21 to BMI < 23': 2,
    'BMI = 23 and > 23': 3,
  },
  'Takes more than 3 medications per day': {
    Yes: 0,
    No: 1,
  },
  'In comparison with other people of the same age, how does the patient consider his/her health status?':
    {
      'Not as good': 0,
      'Does not know': 1,
      'As good': 1,
      Better: 2,
    },
  Age: {
    '> 85': 0,
    '80 - 85': 1,
    '< 80': 2,
  },
  thresold: 14,
};

export const sarcFScoreMapping = {
  'Strength - How much difficulty do you have in lifting and carrying 10 pounds?':
    {
      None: 0,
      Some: 1,
      'A lot or unable': 2,
    },
  'Assistance in walking - How much difficulty do you have walking across a room?':
    {
      None: 0,
      Some: 1,
      'A lot, use aids or unable': 2,
    },
  'Raise from a chair - How much difficulty do you have transferring from a chair or bed?':
    {
      None: 0,
      Some: 1,
      'A lot or unable without help': 2,
    },
  'Climb stairs - How much difficulty do you have climbing a flight of 10 stairs?':
    {
      None: 0,
      Some: 1,
      'A lot or unable': 2,
    },
  'How many times have you fallen in the past year?': {
    None: 0,
    '1-3 falls': 1,
    '4 or more falls': 2,
  },
  thresold: 4,
};

export const distressMapping = {
  thresold: 7,
};
