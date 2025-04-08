```
+------------------------------------------+
|                  users                    |
+------------------------------------------+
| id: UUID (PK)                            |
| email: VARCHAR(255) UNIQUE NOT NULL      |
| password_hash: VARCHAR(255) NOT NULL     |
| role: ENUM('client', 'trainer', 'admin') |
| first_name: VARCHAR(100) NOT NULL        |
| last_name: VARCHAR(100) NOT NULL         |
| profile_image: VARCHAR(255)              |
| phone: VARCHAR(20)                       |
| created_at: TIMESTAMP                    |
| updated_at: TIMESTAMP                    |
| last_login: TIMESTAMP                    |
| is_verified: BOOLEAN                     |
| is_active: BOOLEAN                       |
+------------------------------------------+

+------------------------------------------+
|              trainer_profiles            |
+------------------------------------------+
| id: UUID (PK)                            |
| user_id: UUID (FK to users.id)           |
| bio: TEXT                                |
| specializations: TEXT[]                  |
| years_experience: INTEGER                |
| location: VARCHAR(255)                   |
| is_verified: BOOLEAN                     |
| avg_rating: DECIMAL(3,2)                 |
| hourly_rate: DECIMAL(10,2)               |
| availability_hours: JSONB                |
| created_at: TIMESTAMP                    |
| updated_at: TIMESTAMP                    |
+------------------------------------------+

+------------------------------------------+
|              certifications              |
+------------------------------------------+
| id: UUID (PK)                            |
| trainer_id: UUID (FK to trainer_profiles.id) |
| name: VARCHAR(255) NOT NULL              |
| issuing_organization: VARCHAR(255)       |
| issue_date: DATE                         |
| expiry_date: DATE                        |
| verification_url: VARCHAR(255)           |
| document_url: VARCHAR(255)               |
| is_verified: BOOLEAN                     |
| created_at: TIMESTAMP                    |
| updated_at: TIMESTAMP                    |
+------------------------------------------+

+------------------------------------------+
|              client_profiles             |
+------------------------------------------+
| id: UUID (PK)                            |
| user_id: UUID (FK to users.id)           |
| fitness_goals: TEXT                      |
| health_conditions: TEXT                  |
| height: DECIMAL(5,2)                     |
| weight: DECIMAL(5,2)                     |
| date_of_birth: DATE                      |
| gender: VARCHAR(50)                      |
| created_at: TIMESTAMP                    |
| updated_at: TIMESTAMP                    |
+------------------------------------------+

+------------------------------------------+
|              trainer_services            |
+------------------------------------------+
| id: UUID (PK)                            |
| trainer_id: UUID (FK to trainer_profiles.id) |
| name: VARCHAR(255) NOT NULL              |
| description: TEXT                        |
| duration: INTEGER                        |
| price: DECIMAL(10,2)                     |
| is_group: BOOLEAN                        |
| max_participants: INTEGER                |
| is_active: BOOLEAN                       |
| created_at: TIMESTAMP                    |
| updated_at: TIMESTAMP                    |
+------------------------------------------+

+------------------------------------------+
|                bookings                  |
+------------------------------------------+
| id: UUID (PK)                            |
| client_id: UUID (FK to users.id)         |
| trainer_id: UUID (FK to users.id)        |
| service_id: UUID (FK to trainer_services.id) |
| start_time: TIMESTAMP                    |
| end_time: TIMESTAMP                      |
| status: ENUM('pending', 'confirmed',     |
|              'completed', 'cancelled')   |
| cancellation_reason: TEXT                |
| zoom_meeting_id: VARCHAR(255)            |
| zoom_meeting_url: VARCHAR(255)           |
| zoom_meeting_password: VARCHAR(50)       |
| notes: TEXT                              |
| created_at: TIMESTAMP                    |
| updated_at: TIMESTAMP                    |
+------------------------------------------+

+------------------------------------------+
|               payments                   |
+------------------------------------------+
| id: UUID (PK)                            |
| booking_id: UUID (FK to bookings.id)     |
| client_id: UUID (FK to users.id)         |
| trainer_id: UUID (FK to users.id)        |
| amount: DECIMAL(10,2)                    |
| currency: VARCHAR(3)                     |
| status: ENUM('pending', 'completed',     |
|              'refunded', 'failed')       |
| payment_method: VARCHAR(50)              |
| transaction_id: VARCHAR(255)             |
| stripe_payment_intent_id: VARCHAR(255)   |
| refund_amount: DECIMAL(10,2)             |
| platform_fee: DECIMAL(10,2)              |
| trainer_payout: DECIMAL(10,2)            |
| created_at: TIMESTAMP                    |
| updated_at: TIMESTAMP                    |
+------------------------------------------+

+------------------------------------------+
|                reviews                   |
+------------------------------------------+
| id: UUID (PK)                            |
| booking_id: UUID (FK to bookings.id)     |
| client_id: UUID (FK to users.id)         |
| trainer_id: UUID (FK to users.id)        |
| rating: INTEGER                          |
| comment: TEXT                            |
| is_public: BOOLEAN                       |
| created_at: TIMESTAMP                    |
| updated_at: TIMESTAMP                    |
+------------------------------------------+

+------------------------------------------+
|              trainer_packages            |
+------------------------------------------+
| id: UUID (PK)                            |
| trainer_id: UUID (FK to trainer_profiles.id) |
| name: VARCHAR(255) NOT NULL              |
| description: TEXT                        |
| service_id: UUID (FK to trainer_services.id) |
| session_count: INTEGER                   |
| price: DECIMAL(10,2)                     |
| validity_days: INTEGER                   |
| is_active: BOOLEAN                       |
| created_at: TIMESTAMP                    |
| updated_at: TIMESTAMP                    |
+------------------------------------------+

+------------------------------------------+
|              client_packages             |
+------------------------------------------+
| id: UUID (PK)                            |
| client_id: UUID (FK to users.id)         |
| package_id: UUID (FK to trainer_packages.id) |
| sessions_remaining: INTEGER              |
| purchase_date: TIMESTAMP                 |
| expiry_date: TIMESTAMP                   |
| payment_id: UUID (FK to payments.id)     |
| created_at: TIMESTAMP                    |
| updated_at: TIMESTAMP                    |
+------------------------------------------+

+------------------------------------------+
|              notifications               |
+------------------------------------------+
| id: UUID (PK)                            |
| user_id: UUID (FK to users.id)           |
| type: VARCHAR(50)                        |
| title: VARCHAR(255)                      |
| message: TEXT                            |
| is_read: BOOLEAN                         |
| related_id: UUID                         |
| created_at: TIMESTAMP                    |
+------------------------------------------+

+------------------------------------------+
|            notification_settings         |
+------------------------------------------+
| id: UUID (PK)                            |
| user_id: UUID (FK to users.id)           |
| email_bookings: BOOLEAN                  |
| email_reminders: BOOLEAN                 |
| email_promotions: BOOLEAN                |
| sms_bookings: BOOLEAN                    |
| sms_reminders: BOOLEAN                   |
| push_enabled: BOOLEAN                    |
| created_at: TIMESTAMP                    |
| updated_at: TIMESTAMP                    |
+------------------------------------------+

+------------------------------------------+
|                loyalty_points            |
+------------------------------------------+
| id: UUID (PK)                            |
| user_id: UUID (FK to users.id)           |
| points: INTEGER                          |
| transaction_type: VARCHAR(50)            |
| description: TEXT                        |
| related_id: UUID                         |
| created_at: TIMESTAMP                    |
+------------------------------------------+

+------------------------------------------+
|                  badges                  |
+------------------------------------------+
| id: UUID (PK)                            |
| name: VARCHAR(100)                       |
| description: TEXT                        |
| image_url: VARCHAR(255)                  |
| criteria: TEXT                           |
| created_at: TIMESTAMP                    |
+------------------------------------------+

+------------------------------------------+
|               user_badges                |
+------------------------------------------+
| id: UUID (PK)                            |
| user_id: UUID (FK to users.id)           |
| badge_id: UUID (FK to badges.id)         |
| awarded_at: TIMESTAMP                    |
+------------------------------------------+

+------------------------------------------+
|                referrals                 |
+------------------------------------------+
| id: UUID (PK)                            |
| referrer_id: UUID (FK to users.id)       |
| referred_id: UUID (FK to users.id)       |
| referral_code: VARCHAR(50)               |
| status: ENUM('pending', 'completed')     |
| reward_points: INTEGER                   |
| created_at: TIMESTAMP                    |
| completed_at: TIMESTAMP                  |
+------------------------------------------+
```
