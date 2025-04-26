import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LbdModule } from '../../lbd/lbd.module';
import { NguiMapModule} from '@ngui/map';

import { AdminLayoutRoutes } from './admin-layout.routing';

import { HomeComponent } from '../../home/home.component';
import { UserComponent } from '../../user/user.component';
import { AgentListComponent } from '../../agent-list/agent-list.component';
import { AgentGroupComponent } from '../../agent-group/agent-group.component';
import { QuickTestComponent } from '../../quick-test/quick-test.component';
import { PlannedTestComponent } from '../../planned-test/planned-test.component';
import { TestResultComponent } from '../../test-result/test-result.component';
import { TestProfileComponent } from '../../test-profile/test-profile.component';
import { ThresholdComponent } from '../../threshold/threshold.component';
import { TypographyComponent } from '../../typography/typography.component';
import { IconsComponent } from '../../icons/icons.component';
import { MapsComponent } from '../../maps/maps.component';
import { NotificationsComponent } from '../../notifications/notifications.component';




@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    LbdModule,
    
    NguiMapModule.forRoot({apiUrl: 'https://maps.google.com/maps/api/js?key=YOUR_KEY_HERE'})
  ],
  declarations: [
    HomeComponent,
    UserComponent,
    AgentListComponent,
    AgentGroupComponent,
    QuickTestComponent,
    PlannedTestComponent,
    TestResultComponent,
    TestProfileComponent,
    ThresholdComponent,
    TypographyComponent,
    IconsComponent,
    MapsComponent,
    NotificationsComponent,
  ]
})

export class AdminLayoutModule {}
