// src/seeds/data/categoriesAndQuestions.data.ts
export default [
  {
    name: 'Reason for Visit',
    questions: [
      {
        text: 'Can you describe the reason for your visit today?',
        type: 'text',
      },
    ],
  },
  {
    name: 'Distress Screening',
    questions: [
      {
        text: 'How would you rate your level of pain right now?',
        type: 'scale',
        scale: {
          min: 0,
          max: 10,
          description: '0 (No Pain) to 10 (Worst Possible Pain)',
        },
      },
      {
        text: 'How would you rate your level of tiredness?',
        type: 'scale',
        scale: {
          min: 0,
          max: 10,
          description: '0 (No Tiredness) to 10 (Worst Possible Tiredness)',
        },
      },
      {
        text: 'How would you rate your level of drowsiness?',
        type: 'scale',
        scale: {
          min: 0,
          max: 10,
          description: '0 (No Drowsiness) to 10 (Worst Possible Drowsiness)',
        },
      },
      {
        text: 'How would you rate your level of nausea?',
        type: 'scale',
        scale: {
          min: 0,
          max: 10,
          description: '0 (No Nausea) to 10 (Worst Possible Nausea)',
        },
      },
      {
        text: 'How would you rate your appetite?',
        type: 'scale',
        scale: {
          min: 0,
          max: 10,
          description:
            '0 (No Appetite Issues) to 10 (Worst Possible Appetite Issues)',
        },
      },
      {
        text: 'How would you rate your breathing?',
        type: 'scale',
        scale: {
          min: 0,
          max: 10,
          description:
            '0 (No Breathing Issues) to 10 (Worst Possible Breathing Issues)',
        },
      },
      {
        text: 'How would you describe your mood?',
        type: 'scale',
        scale: {
          min: 0,
          max: 10,
          description: '0 (Worst Mood) to 10 (Best Mood)',
        },
      },
      {
        text: 'How anxious do you feel?',
        type: 'scale',
        scale: {
          min: 0,
          max: 10,
          description: '0 (No Anxiety) to 10 (Worst Possible Anxiety)',
        },
      },
      {
        text: 'How would you rate your overall wellbeing?',
        type: 'scale',
        scale: {
          min: 0,
          max: 10,
          description: '0 (Worst Wellbeing) to 10 (Best Wellbeing)',
        },
      },
      {
        text: "Are there any other symptoms you are experiencing that we haven't discussed?",
        type: 'scale',
        scale: {
          min: 0,
          max: 10,
          description: '0 (No Symptoms) to 10 (Severe Symptoms)',
        },
      },
      {
        text: 'Interactive Image of the Front and Back Human Body – User can draw locations where they feel pain.',
        type: 'interactive_image',
        description: 'User can draw pain points on an interactive body map.',
      },
    ],
  },
  {
    name: 'Medical History',
    questions: [
      {
        text: 'Do you have any chronic conditions or ongoing medical issues?',
        type: 'text',
      },
      {
        text: 'Have you had any surgeries or hospitalizations in the past? If yes, can you provide details?',
        type: 'text',
      },
    ],
  },
  {
    name: 'Medication and Allergies',
    questions: [
      {
        text: 'Are you currently taking any medications, supplements, or over-the-counter drugs? If so, which?',
        type: 'text',
      },
      {
        text: 'Do you have any known allergies, particularly to medications, food, or environmental factors? If so, which?',
        type: 'text',
      },
    ],
  },
  {
    name: 'Lifestyle and Habits',
    questions: [
      {
        text: 'Can you speak about your smoking habits, if any?',
        type: 'multiple',
        subQuestions: [
          {
            text: 'How many years have you smoked tobacco?',
            type: 'number',
            unit: 'years',
          },
          {
            text: 'How many packs of cigarettes per day?',
            type: 'number',
            unit: 'packs per day',
          },
          { text: "No, I don't have smoking habits", type: 'boolean' },
        ],
      },
      {
        text: 'Can you speak about your alcohol consumption?',
        type: 'multiple',
        subQuestions: [
          {
            text: 'How many drinks per day?',
            type: 'number',
            unit: 'drinks per day',
          },
          {
            text: 'How many drinks per week?',
            type: 'number',
            unit: 'drinks per week',
          },
          { text: "No, I don't have drinking habits", type: 'boolean' },
        ],
      },
      {
        text: 'Can you speak about your drug consumption, such as cannabis, cocaine, heroin, or any other drugs?',
        type: 'multiple',
        subQuestions: [
          {
            text: 'Please specify your drug consumption',
            type: 'mixed',
            options: ['cannabis', 'cocaine', 'heroin'],
            additionalText: 'any other drugs?',
            timeUnit: ['per month', 'per week', 'per day', 'per year'],
          },
          { text: "No, I don't consume any drugs", type: 'boolean' },
        ],
      },
      {
        text: 'Are there any significant lifestyle changes or stressors that have recently occurred?',
        type: 'multiple',
        subQuestions: [
          {
            text: 'Please describe any recent lifestyle changes or stressors.',
            type: 'text',
          },
          {
            text: "No, I haven't experienced any significant lifestyle changes recently.",
            type: 'boolean',
          },
        ],
      },
    ],
  },
  {
    name: 'Family Medical History',
    questions: [
      {
        text: 'Is there any significant medical history in your family, such as heart disease, diabetes, cancer, or genetic disorders?',
        type: 'multiple',
        subQuestions: [
          {
            text: 'Please describe any significant medical history in your family.',
            type: 'text',
          },
          {
            text: 'No, there is no significant medical history in my family.',
            type: 'boolean',
          },
        ],
      },
    ],
  },
  {
    name: 'G8-Questionnaire',
    questions: [
      {
        text: 'Has food intake declined over the past 3 months due to loss of appetite, digestive problems, chewing or swallowing difficulties?',
        type: 'boolean',
        options: [
          'Severe decrease in food intake',
          'Moderate decrease in food intake',
          'No decrease in food intake',
        ],
      },
      {
        text: 'Weight loss during the last 3 months',
        type: 'boolean',
        options: [
          'Weight loss > 3 kg',
          'Does not know',
          'Weight loss between 1 and 3 kgs',
          'No weight loss',
        ],
      },
      {
        text: 'Mobility',
        type: 'boolean',
        options: [
          'Bed or chair bound',
          'Able to get out of bed/chair but does not go out',
          'Goes out',
        ],
      },
      {
        text: 'Neuropsychological problems',
        type: 'boolean',
        options: [
          'Severe dementia or depression',
          'Mild dementia or depression',
          'No psychological problems',
        ],
      },
      {
        text: 'Body Mass Index (BMI)',
        type: 'boolean',
        options: [
          'BMI < 19',
          'BMI = 19 to BMI < 21',
          'BMI = 21 to BMI < 23',
          'BMI = 23 and > 23',
        ],
      },
      {
        text: 'Takes more than 3 medications per day',
        type: 'boolean',
        options: ['Yes', 'No'],
      },
      {
        text: 'In comparison with other people of the same age, how does the patient consider his/her health status?',
        type: 'boolean',
        options: ['Not as good', 'Does not know', 'As good', 'Better'],
      },
      { text: 'Age', type: 'boolean', options: ['> 85', '80 - 85', '< 80'] },
    ],
  },
  {
    name: 'Sarc-F Assessment',
    questions: [
      {
        text: 'Strength - How much difficulty do you have in lifting and carrying 10 pounds?',
        type: 'boolean',
        options: ['None', 'Some', 'A lot or unable'],
      },
      {
        text: 'Assistance in walking - How much difficulty do you have walking across a room?',
        type: 'boolean',
        options: ['None', 'Some', 'A lot, use aids or unable'],
      },
      {
        text: 'Raise from a chair - How much difficulty do you have transferring from a chair or bed?',
        type: 'boolean',
        options: ['None', 'Some', 'A lot or unable without help'],
      },
      {
        text: 'Climb stairs - How much difficulty do you have climbing a flight of 10 stairs?',
        type: 'boolean',
        options: ['None', 'Some', 'A lot or unable'],
      },
      {
        text: 'How many times have you fallen in the past year?',
        type: 'boolean',
        options: ['None', '1-3 falls', '4 or more falls'],
      },
    ],
  },
  {
    name: 'QoL Assessment',
    questions: [
      {
        text: 'Do you have any trouble doing strenuous activities, like carrying a heavy shopping bag or a suitcase?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'Do you have any trouble taking a long walk?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'Do you have any trouble taking a short walk outside of the house?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'Do you need to stay in bed or a chair during the day?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'Do you need help with eating, dressing, washing yourself or using the toilet?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Were you limited in doing either your work or other daily activities?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Were you limited in pursuing your hobbies or other leisure time activities?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Were you short of breath?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Did you need to rest?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Have you had trouble sleeping?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Have you felt weak?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Have you lacked appetite?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Have you felt nauseated?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Have you vomited?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Have you been constipated?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Have you had diarrhea?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Were you tired?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Did pain interfere with your daily activities?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Have you had difficulty in concentrating on things, like reading a newspaper or watching television?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Did you feel tense?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Did you worry?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Did you feel irritable?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Have you had difficulty remembering things?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Has your physical condition or medical treatment interfered with your family life?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Has your physical condition or medical treatment interfered with your social activities?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'During the past week: Has your physical condition or medical treatment caused you financial difficulties?',
        type: 'boolean',
        options: ['Not at all', 'A little', 'Quite a bit', 'Very much'],
      },
      {
        text: 'How would you rate your overall health during the past week?',
        type: 'boolean',
        options: ['1', '2', '3', '4', '5', '6', '7'],
      },
      {
        text: 'How would you rate your overall quality of life during the past week?',
        type: 'boolean',
        options: ['1', '2', '3', '4', '5', '6', '7'],
      },
    ],
  },
];
