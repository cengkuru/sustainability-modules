#!/bin/bash

# Fix all Firebase imports to use the compatibility service

# Files to update
files=(
  "src/app/home/project-list/project-list.component.ts"
  "src/app/home/landing/landing.component.ts"
  "src/app/home/open-data/open-data.component.ts"
  "src/app/home/data-analysis/data-analysis.component.ts"
  "src/app/home/services/email.service.ts"
  "src/app/core/services/policy.service.ts"
  "src/app/dashboard/project/update-project/update-project.component.ts"
  "src/app/dashboard/project/add-project/add-project.component.ts"
)

for file in "${files[@]}"; do
  echo "Updating $file..."
  
  # Replace AngularFirestore import
  sed -i '' "s|import { AngularFirestore } from '@angular/fire/compat/firestore';|import { AngularFirestore } from '../../services/firebase-compat.service';|g" "$file"
  sed -i '' "s|import { AngularFirestore } from \"@angular/fire/compat/firestore\";|import { AngularFirestore } from '../../services/firebase-compat.service';|g" "$file"
  
  # Replace AngularFireDatabase import  
  sed -i '' "s|import { AngularFireDatabase } from '@angular/fire/compat/database';|import { AngularFireDatabase } from '../../services/firebase-compat.service';|g" "$file"
  sed -i '' "s|import { AngularFireDatabase } from \"@angular/fire/compat/database\";|import { AngularFireDatabase } from '../../services/firebase-compat.service';|g" "$file"
  
  # Replace AngularFireAuth import
  sed -i '' "s|import { AngularFireAuth } from '@angular/fire/compat/auth';|import { AngularFireAuth } from '../../services/firebase-compat.service';|g" "$file"
  sed -i '' "s|import { AngularFireAuth } from \"@angular/fire/compat/auth\";|import { AngularFireAuth } from '../../services/firebase-compat.service';|g" "$file"
  sed -i '' "s|import {AngularFireAuth} from \"@angular/fire/compat/auth\";|import { AngularFireAuth } from '../../services/firebase-compat.service';|g" "$file"
  
  # Replace AngularFireFunctions import
  sed -i '' "s|import {AngularFireFunctions} from \"@angular/fire/compat/functions\";|import { AngularFireFunctions } from '../firebase-compat.service';|g" "$file"
  
  # Replace firebase/compat import
  sed -i '' "s|import firebase from \"firebase/compat\";|import { firebase } from '../../services/firebase-compat.service';|g" "$file"
  sed -i '' "s|import firebase from 'firebase/compat';|import { firebase } from '../../services/firebase-compat.service';|g" "$file"
done

echo "All imports updated!"