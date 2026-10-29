/** Original Corpus OS tests target compiled .kernel-dist paths. Resolve only
 * that explicit build prefix to unchanged owner TS sources under tsx. No test
 * expectations or owner implementation are copied or patched. */
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,nextResolve){
 if(context.parentURL?.includes('/tests/')&&specifier.startsWith('../.kernel-dist/'))return nextResolve(specifier.replace('../.kernel-dist/','../').replace(/\.js$/,'.ts'),context);
 return nextResolve(specifier,context);
}});
