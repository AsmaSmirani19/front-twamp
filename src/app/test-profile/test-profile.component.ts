import { Component, OnInit } from '@angular/core';
import { TestProfileService } from './test-profile.service';
import { TestProfile } from './test-profile.model';

@Component({
  selector: 'app-test-profile',
  templateUrl: './test-profile.component.html',
  styleUrls: ['./test-profile.component.scss']
})
export class TestProfileComponent implements OnInit {
  testProfiles: TestProfile[] = [];
  showNewProfilePopup = false;
  isLoading = false;
  errorMessage: string | null = null;

  newProfile = {
    name: '',
    timeBetweenAttempts: '',
    packetSize: ''
  };

  constructor(private testProfileService: TestProfileService) { }

   ngOnInit(): void {
    console.log('Initialisation du composant');
    this.loadTestProfiles();
  }

  loadTestProfiles(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.testProfileService.getTestProfiles().subscribe({
      next: (profiles) => {
        this.testProfiles = profiles;
        this.isLoading = false;
        console.log('Profils chargés:', profiles);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load profiles';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  openNewProfilePopup(): void {
    this.showNewProfilePopup = true;
    this.errorMessage = null;
  }

  closeNewProfilePopup(): void {
    this.showNewProfilePopup = false;
    this.newProfile = { name: '', timeBetweenAttempts: '', packetSize: '' };
  }

 createNewProfile(): void {
  // Reset des erreurs
  this.errorMessage = null;

  // Validation
  if (!this.newProfile.name || !this.newProfile.timeBetweenAttempts || !this.newProfile.packetSize) {
    this.errorMessage = 'Tous les champs sont requis';
    return;
  }

  const timeBetweenAttempts = Number(this.newProfile.timeBetweenAttempts);
  const packetSize = Number(this.newProfile.packetSize);

  if (isNaN(timeBetweenAttempts) || isNaN(packetSize)) {
    this.errorMessage = 'Les valeurs numériques sont invalides';
    return;
  }

  const profileToCreate: Omit<TestProfile, 'id'> = {
    profile_name: this.newProfile.name.trim(),
    creation_date: new Date().toISOString(),
    packet_size: packetSize,
    time_between_attempts: timeBetweenAttempts
  };

  this.isLoading = true;

  this.testProfileService.createTestProfile(profileToCreate).subscribe({
    next: (createdProfile) => {
      this.testProfiles = [...(this.testProfiles || []), createdProfile];
      this.closeNewProfilePopup();
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Erreur complète:', err);
      this.errorMessage = err.message || 'Erreur lors de la création du profil';
      this.isLoading = false;
    }
  });
}

  onDelete(profile: TestProfile): void {
    if (!profile.id) {
      this.errorMessage = 'Impossible de supprimer: ID manquant';
      return;
    }

    if (confirm(`Supprimer le profil "${profile.profile_name}" ?`)) {
      this.testProfileService.deleteTestProfile(profile.id).subscribe({
        next: () => {
          this.testProfiles = this.testProfiles.filter(p => p.id !== profile.id);
          console.log('Profil supprimé:', profile);
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          this.errorMessage = 'Échec de la suppression du profil';
        }
      });
    }
  }

  // À implémenter selon besoin
  onEdit(profile: TestProfile): void {
    console.log('Édition du profil:', profile);
  }
}