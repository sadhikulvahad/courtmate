import { UserRepository } from "../../../domain/interfaces/userRepository";
import { AdvocateFilterOptions } from "../../types/UpdateAdvocateProfileDTO ";



export class GetAllAdvocates {
  constructor(private userRepository: UserRepository) {}

  async execute(filters: AdvocateFilterOptions = {}) {
    try {
      const result = await this.userRepository.findAdvocatesWithFilters(filters);
      
      if (result.advocates.length === 0) {
        return { 
          success: false, 
          error: 'No advocates found matching the criteria' 
        };
      }

      return {
        success: true,
        message: 'Advocates fetched successfully',
        data: result
      };
    } catch (error) {
      console.error('Error fetching advocates:', error);
      return { 
        success: false, 
        error: 'Failed to fetch advocates' 
      };
    }
  }
}