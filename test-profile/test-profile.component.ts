import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-profile',
  templateUrl: './test-profile.component.html',
  styleUrls: ['./test-profile.component.scss']
})
export class TestProfileComponent implements OnInit {

  // Tableau de profils pour afficher dans la table
  testProfiles = [
    {
      name: 'Profile A',
      creationDate: '2025-04-20',
      packetSize: '64MB'
    },
    {
      name: 'Profile B',
      creationDate: '2025-04-18',
      packetSize: '128MB'
    }
  ];

  // Variable pour la gestion de la popup
  showNewProfilePopup = false;

  // Données du nouveau profil
  newProfile = {
    name: '',
    timeBetweenAttempts: '',
    packetSize: ''
  };

  constructor() { }

  ngOnInit(): void {
    // Initialisation si nécessaire
  }

  // Ouvrir la popup pour créer un nouveau profil
  openNewProfilePopup(): void {
    this.showNewProfilePopup = true;
  }

  // Fermer la popup
  closeNewProfilePopup(): void {
    this.showNewProfilePopup = false;
    // Réinitialiser les champs du formulaire
    this.newProfile = { name: '', timeBetweenAttempts: '', packetSize: '' };
  }

  // Fonction pour créer un nouveau profil
  createNewProfile(): void {
    // Vérifie que les champs sont remplis
    if (this.newProfile.name && this.newProfile.timeBetweenAttempts && this.newProfile.packetSize) {
      // Ajouter le nouveau profil au tableau
      const newProfile = {
        ...this.newProfile,
        creationDate: new Date().toLocaleDateString(),
        packetSize: `${this.newProfile.packetSize} Bytes`
      };
      this.testProfiles.push(newProfile);
      console.log('New profile created:', newProfile);
      // Fermer la popup après création
      this.closeNewProfilePopup();
    } else {
      console.log('Please fill in all fields');
    }
  }

  // Editer un profil existant
  onEdit(profile: any): void {
    console.log('Editing profile:', profile);
    // Ouvrir un formulaire d'édition, si nécessaire
  }

  // Supprimer un profil
  onDelete(profile: any): void {
    const index = this.testProfiles.indexOf(profile);
    if (index !== -1) {
      this.testProfiles.splice(index, 1);
      console.log('Profile deleted:', profile);
    }
  }

}
