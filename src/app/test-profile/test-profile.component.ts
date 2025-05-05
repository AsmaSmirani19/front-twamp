import { Component, OnInit } from '@angular/core';
import { TestProfileService } from './test-profile.service';
import { TestProfile } from './test-profile.model';

@Component({
  selector: 'app-test-profile',
  templateUrl: './test-profile.component.html',
  styleUrls: ['./test-profile.component.scss']
})
export class TestProfileComponent implements OnInit {

  // Tableau de profils pour afficher dans la table (initialisé vide)
  testProfiles: TestProfile[] = [];

  // Variable pour la gestion de la popup
  showNewProfilePopup = false;

  // Données du nouveau profil
  newProfile = {
    name: '',
    timeBetweenAttempts: '',
    packetSize: ''
  };

  constructor(private testProfileService: TestProfileService) { }

  ngOnInit(): void {
    // Récupérer les profils depuis l'API lors de l'initialisation du composant
    this.loadTestProfiles();
  }

  // Fonction pour charger les profils depuis l'API
  loadTestProfiles(): void {
    this.testProfileService.getTestProfiles().subscribe(
      (profiles: TestProfile[]) => {
        this.testProfiles = profiles;
        console.log('Profiles loaded:', profiles); // Afficher la réponse
      },
      (error) => {
        console.error('Error loading profiles:', error); // Afficher l'erreur
        if (error.status === 400) {
          console.error('Bad request, check API response');
        } else if (error.status === 404) {
          console.error('API endpoint not found');
        }
      }
    );
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
      const profileToCreate: TestProfile = {
        profile_name: this.newProfile.name,
        creation_date: new Date().toISOString(), // Utilisation de toISOString pour un format ISO valide
        // Conversion de packetSize en nombre
        packet_size: parseInt(this.newProfile.packetSize, 10)
      };
      
      // Envoie du profil au backend via le service
      this.testProfileService.createTestProfile(profileToCreate).subscribe(
        (response: TestProfile) => {
          console.log('New profile created:', response);
          // Assure-toi que la réponse est bien de type TestProfile
          this.testProfiles.push(response); // Ajoute le profil créé à la liste
          this.closeNewProfilePopup(); // Ferme la popup après création
        },
        (error) => {
          console.error('Error creating profile:', error);
        }
      );
    } else {
      console.log('Please fill in all fields');
    }
  }

  // Editer un profil existant
  onEdit(profile: TestProfile): void {
    console.log('Editing profile:', profile);
    // Ouvrir un formulaire d'édition, si nécessaire
  }

  // Supprimer un profil
  onDelete(profile: TestProfile): void {
    const index = this.testProfiles.indexOf(profile);
    if (index !== -1) {
      this.testProfiles.splice(index, 1);
      console.log('Profile deleted:', profile);
    }
  }
}
