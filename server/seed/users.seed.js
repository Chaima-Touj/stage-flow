export default [
  {
    name: "Admin StageFlow",
    email: "admin@stageflow.tn",
    password: "StageFlow123",
    role: "admin",
    phone: "71000000",
    isActive: true
  },

  {
    name: "Chaima Touj",
    email: "chaima.touj@imset.com",
    password: "StageFlow123",
    role: "étudiant",

    phone: "+21622345678",
    university: "IMSET Tunis",
    specialty: "Informatique de Gestion",

    bio: "Étudiante passionnée par le développement full-stack.",

    education: {
      institution: "IMSET Tunis",
      degree: "BTS",
      fieldOfStudy: "Informatique de Gestion",
      current: false,
      grade: "16.2/20",
      courses: [
        "Algorithmique",
        "Développement Web"
      ]
    },

    experience: [
      {
        company: "BeeCoders",
        position: "Développeur Web Junior",
        location: "Tunis",
        current: false,
        description: "Développement web",
        technologies: [
          "PHP",
          "JavaScript"
        ]
      }
    ],

    skills: [
      {
        name: "React.js",
        level: "Avancé",
        category: "Frontend"
      },
      {
        name: "Node.js",
        level: "Intermédiaire",
        category: "Backend"
      }
    ],

    languages: [
      {
        name: "Arabe",
        level: "Natif"
      },
      {
        name: "Français",
        level: "Courant"
      }
    ],

    socialLinks: {
      linkedin: "",
      github: "",
      portfolio: ""
    }
  }
];