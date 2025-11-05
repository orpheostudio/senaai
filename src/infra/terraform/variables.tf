# 🌙 Yume Chatbot - Terraform Variables
# Configuration variables for AWS infrastructure

# ===== GENERAL =====
variable "environment" {
  description = "Environment name (e.g., dev, staging, production)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "yume-ai.com"
}

# ===== NETWORKING =====
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

# ===== DATABASE =====
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
  
  validation {
    condition = can(regex("^db\\.", var.db_instance_class))
    error_message = "DB instance class must start with 'db.'."
  }
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS instance (GB)"
  type        = number
  default     = 20
  
  validation {
    condition     = var.db_allocated_storage >= 20 && var.db_allocated_storage <= 1000
    error_message = "DB allocated storage must be between 20 and 1000 GB."
  }
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for RDS instance (GB)"
  type        = number
  default     = 100
  
  validation {
    condition     = var.db_max_allocated_storage >= 20 && var.db_max_allocated_storage <= 1000
    error_message = "DB max allocated storage must be between 20 and 1000 GB."
  }
}

variable "db_username" {
  description = "Username for the database"
  type        = string
  default     = "yume"
  sensitive   = true
}

variable "db_password" {
  description = "Password for the database"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.db_password) >= 8
    error_message = "Database password must be at least 8 characters long."
  }
}

# ===== REDIS =====
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
  
  validation {
    condition = can(regex("^cache\\.", var.redis_node_type))
    error_message = "Redis node type must start with 'cache.'."
  }
}

variable "redis_num_cache_nodes" {
  description = "Number of cache nodes for Redis"
  type        = number
  default     = 1
  
  validation {
    condition     = var.redis_num_cache_nodes >= 1 && var.redis_num_cache_nodes <= 6
    error_message = "Redis num cache nodes must be between 1 and 6."
  }
}

variable "redis_auth_token" {
  description = "Auth token for Redis"
  type        = string
  sensitive   = true
  default     = null
}

# ===== ECS =====
variable "backend_cpu" {
  description = "CPU units for backend task"
  type        = number
  default     = 512
  
  validation {
    condition = contains([256, 512, 1024, 2048, 4096], var.backend_cpu)
    error_message = "Backend CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "backend_memory" {
  description = "Memory (MB) for backend task"
  type        = number
  default     = 1024
  
  validation {
    condition = contains([512, 1024, 2048, 3072, 4096, 5120, 6144, 7168, 8192], var.backend_memory)
    error_message = "Backend memory must be a valid value for the selected CPU."
  }
}

variable "frontend_cpu" {
  description = "CPU units for frontend task"
  type        = number
  default     = 256
  
  validation {
    condition = contains([256, 512, 1024, 2048, 4096], var.frontend_cpu)
    error_message = "Frontend CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "frontend_memory" {
  description = "Memory (MB) for frontend task"
  type        = number
  default     = 512
  
  validation {
    condition = contains([512, 1024, 2048, 3072, 4096, 5120, 6144, 7168, 8192], var.frontend_memory)
    error_message = "Frontend memory must be a valid value for the selected CPU."
  }
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 1
  
  validation {
    condition     = var.backend_desired_count >= 1 && var.backend_desired_count <= 10
    error_message = "Backend desired count must be between 1 and 10."
  }
}

variable "frontend_desired_count" {
  description = "Desired number of frontend tasks"
  type        = number
  default     = 1
  
  validation {
    condition     = var.frontend_desired_count >= 1 && var.frontend_desired_count <= 10
    error_message = "Frontend desired count must be between 1 and 10."
  }
}

# ===== APPLICATION CONFIGURATION =====
variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.jwt_secret) >= 32
    error_message = "JWT secret must be at least 32 characters long."
  }
}

variable "mistral_api_key" {
  description = "Mistral AI API key"
  type        = string
  sensitive   = true
}

variable "mistral_model" {
  description = "Default Mistral model to use"
  type        = string
  default     = "mistral-7b-instruct"
}

variable "node_env" {
  description = "Node.js environment"
  type        = string
  default     = "production"
  
  validation {
    condition     = contains(["development", "staging", "production"], var.node_env)
    error_message = "Node environment must be one of: development, staging, production."
  }
}

# ===== MONITORING =====
variable "enable_detailed_monitoring" {
  description = "Enable detailed CloudWatch monitoring"
  type        = bool
  default     = false
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
  
  validation {
    condition = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.log_retention_days)
    error_message = "Log retention days must be a valid CloudWatch retention period."
  }
}

# ===== SCALING =====
variable "enable_autoscaling" {
  description = "Enable ECS auto scaling"
  type        = bool
  default     = true
}

variable "min_capacity" {
  description = "Minimum number of tasks for auto scaling"
  type        = number
  default     = 1
  
  validation {
    condition     = var.min_capacity >= 1 && var.min_capacity <= 100
    error_message = "Minimum capacity must be between 1 and 100."
  }
}

variable "max_capacity" {
  description = "Maximum number of tasks for auto scaling"
  type        = number
  default     = 10
  
  validation {
    condition     = var.max_capacity >= 1 && var.max_capacity <= 100
    error_message = "Maximum capacity must be between 1 and 100."
  }
}

variable "target_cpu_utilization" {
  description = "Target CPU utilization for auto scaling"
  type        = number
  default     = 70
  
  validation {
    condition     = var.target_cpu_utilization >= 10 && var.target_cpu_utilization <= 90
    error_message = "Target CPU utilization must be between 10 and 90."
  }
}

variable "target_memory_utilization" {
  description = "Target memory utilization for auto scaling"
  type        = number
  default     = 80
  
  validation {
    condition     = var.target_memory_utilization >= 10 && var.target_memory_utilization <= 90
    error_message = "Target memory utilization must be between 10 and 90."
  }
}

# ===== BACKUP & DISASTER RECOVERY =====
variable "backup_retention_period" {
  description = "Database backup retention period in days"
  type        = number
  default     = 7
  
  validation {
    condition     = var.backup_retention_period >= 0 && var.backup_retention_period <= 35
    error_message = "Backup retention period must be between 0 and 35 days."
  }
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for critical resources"
  type        = bool
  default     = false
}

# ===== SECURITY =====
variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "enable_waf" {
  description = "Enable AWS WAF"
  type        = bool
  default     = false
}

variable "ssl_policy" {
  description = "SSL security policy for load balancer"
  type        = string
  default     = "ELBSecurityPolicy-TLS-1-2-2017-01"
}

# ===== COST OPTIMIZATION =====
variable "use_spot_instances" {
  description = "Use Spot instances for cost optimization"
  type        = bool
  default     = false
}

variable "enable_container_insights" {
  description = "Enable Container Insights for ECS"
  type        = bool
  default     = false
}

# ===== FEATURE FLAGS =====
variable "enable_vpc_flow_logs" {
  description = "Enable VPC Flow Logs"
  type        = bool
  default     = true
}

variable "enable_config" {
  description = "Enable AWS Config for compliance monitoring"
  type        = bool
  default     = false
}

variable "enable_cloudtrail" {
  description = "Enable CloudTrail for audit logging"
  type        = bool
  default     = false
}

# ===== TAGS =====
variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "cost_center" {
  description = "Cost center for billing"
  type        = string
  default     = "engineering"
}

variable "owner" {
  description = "Owner of the resources"
  type        = string
  default     = "yume-team"
}