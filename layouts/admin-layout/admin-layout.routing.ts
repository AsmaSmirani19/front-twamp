import { Routes } from '@angular/router';

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



export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: HomeComponent },
    { path: 'user',           component: UserComponent },
    { path: 'agent',          component: AgentListComponent },
    { path: 'agent-group',    component: AgentGroupComponent },
    { path: 'quick-test',    component: QuickTestComponent },
    { path: 'planned-test',    component: PlannedTestComponent },
    { path: 'test-result',    component: TestResultComponent },
    { path: 'threshold',       component: ThresholdComponent },

    { path: 'test-profile',    component: TestProfileComponent },
    { path: 'typography',     component: TypographyComponent },
    { path: 'icons',          component: IconsComponent },
    { path: 'maps',           component: MapsComponent },
    { path: 'notifications',  component: NotificationsComponent },
];
