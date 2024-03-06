//
//  BrazeManager.m
//  BrazeManualInitialisation
//
//  Created by Sukh on 05/03/2024.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_REMAP_MODULE(BrazeManager, BrazeManager, NSObject)
RCT_EXTERN_METHOD(initialiseSDK:(NSString *)userId withBrazeToken:(NSString *)brazeToken resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
@end
